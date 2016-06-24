import re

# Regular expressions
re1 = re.compile('(Message-ID(.*?\n)*X-FileName.*?\n)|(To:(.*?\n)*?Subject.*?\n)|(< (Message-ID(.*?\n)*.*?X-FileName.*?\n))')
re2 = re.compile('<|>|(\s---(.*?\n)?.*?---\s)|(.*?:(\s|(.*?\s)|))|(\(\d+\))|(\s.*?\..*?\s)|(\s.*?\_.*?\s)|(\s.*?\-.*?\s)|(\s.*\/.*?\s)|(\s.*@.*?\s)|([\d\-\(\)\\\/\#\=]+(\s|\.))|(\n.*?\s)|\d')
re3 = re.compile('\s.\s|\s+')


text = open('example_text.txt').read()

print(text)
text = re.sub(re1, ' ', text)
text = re.sub(re2, ' ', text)
text = re.sub(re3, ' ', text)
#for i in range(0,3):
#    text = re.sub('re'+str(i+1), ' ', text)
print('##############################################################')    
print(text)

docs = []

chdir('/home/peter/Downloads/enron')
# For each user we extract all the emails in their inbox

names = [i for i in listdir('/home/peter/Downloads/enron')]
for name in names:
    sent = '/home/peter/Downloads/enron/' + str(name) + '/sent'   
    try: 
        chdir(sent)     
        for email in listdir(sent):
            text = open(email,'r').read()
            
            # Regular expressions are used below to remove 'clutter'
            text = re.sub(re1,' ',text)
            text = re.sub(re2,' ',text)
            text = re.sub(re3,'',text)
            text = re.sub(re4,' ',text)
            docs.append(text)           
    except:
        pass
