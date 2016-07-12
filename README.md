# Topip modelling using LDA
The Enron database (specifically the emails in the employee's 'sent' directories) is analysed using Latent Dirichlet allocation (LDA).
The [Gensim](https://radimrehurek.com/gensim/index.html) library is used to perform the LDA analysis. This provides a number of key
words for each of the 20 topics considered. From here, custom functions are implemented in order to analyse the prevalence
of key words within a document of the user's choice. Functions are also created to determine the key topics for a specific
employee as well as to determine the employees of note for a given topic. The entire analysis was done by using a Jupyter Notebook and Python 3.5. Please see Enron_unfiltered_sent_2.ipynb for the final Notebook used. Also click [here](peter-thompson.github.io) for a visual representation of the data. 

## Setting up & installing packages

Firsty, make sure to download the Enron dataset [here](https://www.cs.cmu.edu/~./enron/) and install the Python packages, [gensim](https://radimrehurek.com/gensim/install.html), [NLTK](http://www.nltk.org/install.html) and [stop-words](https://pypi.python.org/pypi/stop-words). 

Further, in order to use the lemmatizer locally, run Python and type the commands:

```python
import nltk
nltk.download()
```
whereafer select the Corpora tab and download wordnet. 

We are now ready to start the LDA analysis of the Enron dataset.

## Defining the regular expressions and importing the dataset

We are going to place all the emails of each user into one large list. In order to utalise the LDA algorithm we require there to me multiple documents. The obvious question that arises is whether to consider each email as a seperate document, or to consider the collection of each user's emails as a seperate document. For example:
Consider person  A  has emails  A1, A2, A3  and person  B  has emails  B1  and  B2 . Then we can create a list that is L = [A1, A2, A3, B1, B2] or L = [A1A2A3, B1B2]. For now, all the emails are going to be treated as seperate documents.
Once the LDA algorithm has been implemented, we want to be able to list all the documents that fall under a given catagory.
We now set up the regular expressions to remove the 'clutter' from the emails. (Note, they are purposefully long to avoid successive searches through large data)

```python
from os import listdir, chdir
import re

re1 = re.compile('(Message-ID(.*?\n)*X-FileName.*?\n)|'
                 '(To:(.*?\n)*?Subject.*?\n)|'
                 '(< (Message-ID(.*?\n)*.*?X-FileName.*?\n))')
re2 = re.compile('<|'
                 '>|'
                 '(---(.*?\n)?.*?---)|'
                 '(\*\*[.*?\s]\*\*)|'
                 '(.*?:(\s|(.*?\s)|))|'
                 '(\(\d+\))|'
                 '(\s.*?\..*?\s)|'
                 '(\s.*?\_.*?\s)|'
                 '(\s.*?\-.*?\s)|'
                 '(\s.*\/.*?\s)|'
                 '(\s.*@.*?\s)|'
                 '([\d\-\(\)\\\/\#\=]+(\s|\.))|'
                 '(\n.*?\s)|\d')
re3 = re.compile('\\\'')
re4 = re.compile('( . )|\s+')
```

We now build a list of strings - each string being an email (document). 
Each document is filtered according to the regular expressions above. 
We also build a dictionary, namely, docs_num_dict that stores for each iteration of a name, 
the corresponding name and as well as a list of the filtered text.

Take note to input the path to the enron dataset directory.

```python
from collections import defaultdict

docs = []
docs_num_dict = [] # Stores email sender's name and number

chdir('path-to-enron')
# For each user we extract all the emails in their inbox

names = [i for i in listdir()]
m = 0
for name in names:
    sent = 'path-to-enron' + str(name) + '/sent'   
    try: 
        chdir(sent)
        d = []
        for email in listdir():          
            text = open(email,'r').read()
            # Regular expressions are used below to remove 'clutter'
            text = re.sub(re1, ' ', text)
            text = re.sub(re2, ' ', text)
            text = re.sub(re3, ' ', text)
            text = re.sub(re4, ' ', text)
            docs.append(text)
            d.append(text)
        docs_num_dict.append((m,[name,d]))
        m += 1
    except:
        pass
    
docs_num_dict = dict(docs_num_dict)
```
We can make use of either a) Stemming or b) Lemmatizing to find word roots. See [here](http://textminingonline.com/dive-into-nltk-part-iv-stemming-and-lemmatization) for a more detailed explination of the two. Right below, the lemmatizer is implemented. 

The stemmer generally cuts off prefixes of words according to some set rules. Thus words like 'facilitate' and shortened to 'faci' - this can be confusing and requires that the words are 're-built' before displayed. The lemmatizer also used set rules for words of a certain form, but it has the advantage of comparing words to a dictionary.

In general, the lemmatizer will have preference of use. 

While creating a new 'texts' variable that stores the filtered documents, 
we also edit the docs_num_dict to update the words according to the tokenize,stop word, 
emmatize procedure.

## Using the Lemmatizer

```python
# To build the dictionary
from collections import defaultdict
d = defaultdict(int)

# We now employ the techniques as outline in the second link at the top - see **
from stop_words import get_stop_words
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import RegexpTokenizer
tokenizer = RegexpTokenizer(r'\w+')

texts = []

for i in range(0,len(docs_num_dict.items())):
    new_docs_num_dict_1 = []
    for doc in docs_num_dict[i][1]:
        # Tokenization
        raw = doc.lower()
        tokens = tokenizer.tokenize(raw)

        # Removing stop words

        # create English stop words list
        en_stop = get_stop_words('en')

        # remove stop words from tokens
        stopped_tokens = [i for i in tokens if not i in en_stop]

        # Stemming 

        # Create p_stemmer of class PorterStemmer
        wordnet_lemmatizer = WordNetLemmatizer()

        # stem token
        lemmatized_tokens = [wordnet_lemmatizer.lemmatize(i) for i in stopped_tokens]

        texts.append(lemmatized_tokens)
        new_docs_num_dict_1.append(lemmatized_tokens)

        # We now build the dictionary
        for word in lemmatized_tokens:
            d[word] += 1  
    docs_num_dict[i][1] = new_docs_num_dict_1

```
We now build the dictionary of dictionaries, docs_name_dict. The dictinary associates to the names of each employee, a dictionary that stores all the words used by the given person, as well as the number of times they used each of these words. 

```python
from collections import defaultdict
docs_name_dict = []

for i in range(0,len(docs_num_dict.items())):
    temp_dict = defaultdict(int)
    for j in docs_num_dict[i][1]:
        for k in j:
            temp_dict[k] += 1
    docs_name_dict.append((docs_num_dict[i][0],temp_dict)) 
    
docs_name_dict = dict(docs_name_dict)
```

We now want to remove the words from our documents that cause clutter. We will remove all the words that appear in more than 20% of documents as well as removing all the words that occur in less than 4 of the documents. We have a dictionary that counts the number of times a word in present across all the $\pm57000$ documents. 

To further enhance the quality of the text we analyse, the loops below remove all words of length 1 or 2. 

```python

num_docs = len(texts)
temp_texts = texts
texts= []
upper_lim = int(0.20*num_docs)

for doc in temp_texts:
    temp_doc = []
    for word in doc:
        # If the word is in the required interval, we add it to a NEW texts variable
        if 4 < d[word] < upper_lim and len(word) > 2:
            temp_doc.append(word)
        # If the word is not in the required interval, 
        # we lower the index of the word in the docs_name_dict dictinoary
        else:
            for group in docs_name_dict.items():
                person = group[0]
                if word in docs_name_dict[person]:
                    if docs_name_dict[person][word] > 1:
                        docs_name_dict[person][word] -= 1
                    else:
                        del docs_name_dict[person][word]
    texts.append(temp_doc)
```

Below, we construct the document term matrix whereafter the fairly lengthy process of constructing the model takes place. Thus far the model seems be linear. With a single pass, the model takes just upward of a minute to execute, whereas for 5 passes, the model takes roughly 5.5 minutes.

The model was run for 350 passes and took 316 minutes to execute. 

```python
# Constructing a document-term matrix

from gensim import corpora, models

dictionary = corpora.Dictionary(texts)

corpus = [dictionary.doc2bow(text) for text in texts]

# Constructing the model
ldamodel = models.ldamodel.LdaModel(corpus, num_topics=20, id2word = dictionary, passes=350)
```
It is strongly advised to save the ldamodel - 5 hours is a fairly long time!

```python
# Save the ldamodel
ldamodel.save('ldamodel')

# Load ldamodel
ldamodel = models.LdaModel.load('ldamodel') 
```
We now print the words for each of the given topics. It must be noted, that even though considerable emphasis has been placed on the construction of the regular expressions, 'junk-text' may be present.

```python
num_topics = 20
num_words = 10

List = ldamodel.print_topics(num_topics, num_words)
Topic_words =[]
for i in range(0,len(List)):
    word_list = re.sub(r'(.\....\*)|(\+ .\....\*)', '',List[i][1])
    temp = [word for word in word_list.split()]
    Topic_words.append(temp)
    print('Topic ' + str(i) + ': ' + '\n' + str(word_list))
    print('\n' + '-'*100 + '\n')
```
Here is the output with the given number of topics and passes:
```latex
\begin{verbatim}
Topic 0: 
john ect future member broker brent click nymex board jason

----------------------------------------------------------------------------------------------------

Topic 1: 
contract party agreement language may transaction issue term credit payment

----------------------------------------------------------------------------------------------------

Topic 2: 
power california state energy market said utility price electricity cost

----------------------------------------------------------------------------------------------------

Topic 3: 
just get think going one dont day see good time

----------------------------------------------------------------------------------------------------

Topic 4: 
city new university houston school student producer san class administration

----------------------------------------------------------------------------------------------------

Topic 5: 
information need also project access employee process provide like issue

----------------------------------------------------------------------------------------------------

Topic 6: 
agreement attached draft copy document master need change letter form

----------------------------------------------------------------------------------------------------

Topic 7: 
fax texas street smith sara houston shackleton phone legal perlingiere

----------------------------------------------------------------------------------------------------

Topic 8: 
tax sherri corp court loan land story property judge meter

----------------------------------------------------------------------------------------------------

Topic 9: 
gas company energy trading power natural product trade financial pipeline

----------------------------------------------------------------------------------------------------

Topic 10: 
vince forwarded love god game sound year man one play

----------------------------------------------------------------------------------------------------

Topic 11: 
meeting conference call week friday next thursday time monday schedule

----------------------------------------------------------------------------------------------------

Topic 12: 
chris gas ben book daily report volume thanks forwarded need

----------------------------------------------------------------------------------------------------

Topic 13: 
business mark group risk management market new service global trading

----------------------------------------------------------------------------------------------------

Topic 14: 
deal forwarded thanks delainey desk contract tom mike eol zone

----------------------------------------------------------------------------------------------------

Topic 15: 
price shall day option per month date value rate period

----------------------------------------------------------------------------------------------------

Topic 16: 
internet kate investor software computer www buy auction world article

----------------------------------------------------------------------------------------------------

Topic 17: 
jeff debra john bill richard robert kay dasovich david bob

----------------------------------------------------------------------------------------------------

Topic 18: 
know let get jeff need want like thanks call think

----------------------------------------------------------------------------------------------------

Topic 19: 
message intended information email communication may received use recipient error
\end{verbatim}
```
