# Topip modelling using LDA
The Enron database (specifically the emails in the employee's 'sent' directories) is analysed using Latent Dirichlet allocation (LDA).
The [Gensim](https://radimrehurek.com/gensim/index.html) library is used to perform the LDA analysis. This provides a number of key
words for each of the 20 topics considered. From here, custom functions are implemented in order to analyse the prevalence
of key words within a document of the user's choice. Functions are also created to determine the key topics for a specific
employee as well as to determine the employees of note for a given topic. The entire analysis was done by using a Jupyter Notebook and Python 3.5.

Firsty, make sure to download the Enron dataset [here](https://www.cs.cmu.edu/~./enron/) and install the Python packages, [gensim](https://radimrehurek.com/gensim/install.html), [NLTK](http://www.nltk.org/install.html) and [stop-words](https://pypi.python.org/pypi/stop-words). 

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
