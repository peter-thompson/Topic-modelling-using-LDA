import datetime

print('Here we go!',datetime.datetime.now().time())

import json

num_docs = 57330

with open('texts.jsn','r') as f:
    texts = json.load(f)

with open('dictionary.jsn','r') as f:
    d = json.load(f)
    
temp_texts = []
n = 0

for word in d.items():
    if word[1] <=3 or word[1]/num_docs >= 0.25:   
        for doc in texts:
            temp_texts.append(list(filter(lambda a: a != word[0], doc)))
    n += 1
    if n == 100:
        print('made it this far at least!')
    if n%1000 == 0:
        print(n, datetime.datetime.now().time())
        
with open('texts_took_12_hours.jsn','w') as f:
    json.dump(temp_texts,f)
    
print('The end!', datetime.datetime.now().time())
