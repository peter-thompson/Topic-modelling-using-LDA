import re

# Regular expressions
re1 = re.compile('(Message-ID(.*?\n)*X-FileName.*?\n)|'
                 '(To:(.*?\n)*?Subject.*?\n)|'
                 '(< (Message-ID(.*?\n)*.*?X-FileName.*?\n))')
re2 = re.compile('.+@.+') # Remove emails
re3 = re.compile('\s(---------------)(.*?)(---------------)\s', re.DOTALL)
re4 = re.compile('''\s(\*\*\*\*\*)(.*?)(\*\*\*\*\*)\s''', re.DOTALL)
re5 = re.compile('\s(_______________)(.*?)(_______________)\s', re.DOTALL)
re6 = re.compile('\n -.*')
re7 = re.compile('\n(\s)*\d.*')
re8 = re.compile('(\n( )*(\w)+( )*\n )|(\n( )*(\w)+(\s)+(\w)+( )*\n)|(\n( )*(\w)+(\s)+(\w)+(\s)+(\w)+( )*\n)')


text = open('lewis-a_23.').read()

print(text)
text = re.sub(re1, ' ', text)
text = re.sub(re2, ' ', text)
text = re.sub(re3, ' ', text)
text = re.sub(re4, ' ', text)
text = re.sub(re5, ' ', text)
text = re.sub(re6, ' ', text)
text = re.sub(re7, ' ', text)
text = re.sub(re8, ' ', text)

print('##############################################################')    
print(text)

