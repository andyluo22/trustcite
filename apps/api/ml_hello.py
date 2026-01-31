from transformers import pipeline

qa = pipeline("question-answering", model="deepset/roberta-base-squad2")

context = "Vancouver is a coastal city in British Columbia. It is known for its film industry."
question = "What is Vancouver known for?"

print(qa(question=question, context=context))