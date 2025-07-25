#!pip install torch transformers datasets
# summarizer.py
import torch
from transformers import BartForConditionalGeneration, BartTokenizer
from datasets import load_dataset
from torch.utils.data import DataLoader
import logging
import json
import sys
from transformers import pipeline

logging.getLogger("transformers").setLevel(logging.ERROR)

class ForumSummarizer:
    def __init__(self, model_name='facebook/bart-large-xsum', device=None):
        self.device = device if device else ('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        self.tokenizer = BartTokenizer.from_pretrained(model_name)
        self.model = BartForConditionalGeneration.from_pretrained(model_name).to(self.device)
        
    def preprocess_function(self, examples):
        inputs = [f"Content: {doc}" for doc in examples["article"]]
        model_inputs = self.tokenizer(inputs, max_length=512, truncation=True, padding="max_length")
        with self.tokenizer.as_target_tokenizer():
            labels = self.tokenizer(examples["highlights"], max_length=100, truncation=True, padding="max_length")
        model_inputs["labels"] = labels["input_ids"]
        return model_inputs

    def summarize(self, data):
        try:
            combined_content = " ".join(entry["content"] for entry in data)
            input_text = f"Summary: {combined_content}"
            inputs = self.tokenizer(
                input_text,
                return_tensors="pt",
                max_length=2048,
                truncation=True
            ).to(self.device)
            with torch.no_grad():
                summary_ids = self.model.generate(
                    inputs["input_ids"],
                    max_length=512,
                    min_length=70,
                    length_penalty=2.0,
                    num_beams=5,
                    early_stopping=True
                )
            return self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        except Exception as e:
            print(f"Error in summarize: {e}", file=sys.stderr)
            return None
    
    def fine_tune(self, train_dataset, num_epochs=3, batch_size=4):
        self.model.train()
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=5e-5)
        
        tokenized_dataset = train_dataset.map(self.preprocess_function, batched=True)
        tokenized_dataset.set_format(type='torch', columns=['input_ids', 'attention_mask', 'labels'])
        train_dataloader = DataLoader(tokenized_dataset, batch_size=batch_size, shuffle=True)
        
        for epoch in range(num_epochs):
            total_loss = 0
            print(f"Starting Training epoch {epoch + 1}/{num_epochs}")
            for i, batch in enumerate(train_dataloader):
                try:
                    inputs = {k: v.to(self.device) for k, v in batch.items() if k != 'labels'}
                    labels = batch['labels'].to(self.device)
                    outputs = self.model(**inputs, labels=labels)
                    loss = outputs.loss
                    total_loss += loss.item()
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                    optimizer.step()
                    optimizer.zero_grad()
                    if (i + 1) % 10 == 0:
                        print(f"Batch {i + 1}/{len(train_dataloader)}, Current loss: {loss.item():.4f}")
                except Exception as e:
                    print(f"Error in batch {i + 1}/{len(train_dataloader)}: {e}")
                    continue
            avg_loss = total_loss / len(train_dataloader)
            print(f"Epoch {epoch + 1} completed, Average Loss: {avg_loss:.4f}")
    
    def save_model(self, path):
        try:
            self.model.save_pretrained(path)
            self.tokenizer.save_pretrained(path)
            print(f"Model saved successfully to {path}")
        except Exception as e:
            print(f"Error saving model: {e}")

def summarize_text(text):
    summarizer = pipeline("summarization", model="facebook/bart-large-xsum")
    
    max_length = 1024
    if len(text.split()) > max_length:
        text = " ".join(text.split()[:max_length])
    
    summary = summarizer(
        text,
        max_length=100,
        min_length=30,   
        do_sample=False,
        num_beams=4,     
        length_penalty=2.0, 
        early_stopping=True
    )
    return summary[0]['summary_text']

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        content = data['data'][0]['content']
        
        # Generate summary
        summary = summarize_text(content)
        
        # Print the summary
        print(summary)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()