#!/usr/bin/env python3
"""
Neural Injection Detection Service
Loads the model once and processes requests via stdin/stdout.
Input: JSON line {"text": "string"}
Output: JSON line {"isInjection": bool, "confidence": float, "label": string, "inferenceTimeMs": float}
"""

import sys
import json
import time
import torch
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Disable TensorFlow oneDNN warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

MODEL_ID = "ProtectAI/deberta-v3-base-prompt-injection-v2"

def load_model():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    sys.stderr.write(f"Loading model {MODEL_ID} on {device}...\n")
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_ID)
        model.to(device)
        model.eval()
        sys.stderr.write("Model loaded successfully.\n")
        return tokenizer, model, device
    except Exception as e:
        sys.stderr.write(f"Error loading model: {str(e)}\n")
        sys.exit(1)

def main():
    tokenizer, model, device = load_model()
    
    # Signal readiness
    print(json.dumps({"status": "ready"}))
    sys.stdout.flush()
    
    for line in sys.stdin:
        try:
            if not line.strip():
                continue
                
            data = json.loads(line)
            text = data.get("text", "")
            
            if not text:
                print(json.dumps({"error": "No text provided"}))
                sys.stdout.flush()
                continue
                
            start_time = time.time()
            
            inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.softmax(outputs.logits, dim=-1)
            
            inference_time_ms = (time.time() - start_time) * 1000
            
            # Label 1 = injection, Label 0 = benign
            injection_prob = probs[0][1].item()
            is_injection = injection_prob > 0.5
            label = "INJECTION" if is_injection else "SAFE"
            
            result = {
                "isInjection": is_injection,
                "confidence": injection_prob if is_injection else (1 - injection_prob),
                "label": label,
                "inferenceTimeMs": inference_time_ms
            }
            
            print(json.dumps(result))
            sys.stdout.flush()
            
        except json.JSONDecodeError:
            sys.stderr.write("Invalid JSON input\n")
        except Exception as e:
            sys.stderr.write(f"Error processing request: {str(e)}\n")
            print(json.dumps({"error": str(e)}))
            sys.stdout.flush()

if __name__ == "__main__":
    main()
