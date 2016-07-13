# Topic modelling using LDA
The Enron database (specifically the emails in the employee's 'sent' directories) is analysed using Latent Dirichlet allocation (LDA).
The [Gensim](https://radimrehurek.com/gensim/index.html) library is used to perform the LDA analysis. This provides a number of key
words for each of the 20 topics considered. From here, custom functions are implemented in order to analyse the prevalence
of key words within a document of the user's choice. Functions are also created to determine the key topics for a specific
employee as well as to determine the employees of note for a given topic. The entire analysis was done by using a Jupyter Notebook and Python 3.5. Please see **Enron_unfiltered_sent_2.ipynb** for the final Notebook used. Also click [here](https://peter-thompson.github.io/) for a visual representation of the data. 

## Setting up & installing packages

Firsty, make sure to download the Enron dataset [here](https://www.cs.cmu.edu/~./enron/) and install the Python packages, [gensim](https://radimrehurek.com/gensim/install.html), [NLTK](http://www.nltk.org/install.html) and [stop-words](https://pypi.python.org/pypi/stop-words). 

```bash
pip install gensim
pip install nltk
pip install stop-words
```

Further, in order to use the lemmatizer locally, run Python and type the commands:

```python
import nltk
nltk.download()
```
whereafer select the Corpora tab and download wordnet.  In order to visualise the results using the [pyLDAvis](https://pyldavis.readthedocs.io/en/latest/readme.html#installation) package, make sure to install pyLDAvis.

```bash
pip install pyldavis
```

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
We also build a dictionary, namely, `docs_num_dict` that stores for each iteration of a name, 
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
we also edit the `docs_num_dict` to update the words according to the tokenize,stop word, 
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
We now build the dictionary of dictionaries, `docs_name_dict`. The dictinary associates to the names of each employee, a dictionary that stores all the words used by the given person, as well as the number of times they used each of these words. 

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
It is strongly advised to save the `ldamodel` - 5 hours is a fairly long time!

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
```
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
```
We will now proceed to visualise the data above by using the [pyLDAvis](https://pyldavis.readthedocs.io/en/latest/index.html) package.

```python
import warnings
warnings.filterwarnings('ignore')

import pyLDAvis.gensim

lda_visualise = pyLDAvis.gensim.prepare(ldamodel, corpus, dictionary)
pyLDAvis.display(lda_visualise)
```

![alt tag](https://cloud.githubusercontent.com/assets/20296112/16766481/c30b51f2-483a-11e6-89cc-98fcfb6f764a.png)

We use the colour pallate called `Tableau_20` that contains 20 different colours. We assign these to seperate topics. If anyone should have need for more than 20 topics, please modify the code below accordingly. 

```python
from palettable.tableau import Tableau_20

topic_colour_gen = []
for i in range(0,num_topics):
    topic_colour_gen.append((i, Tableau_20.hex_colors[i]))
    
topic_colours = dict(topic_colour_gen)
```

The function below was created to filter through a specific email and highlight the relevant words, according to topic. Further below, a function is implemented to determine the topic distributions of a specific employee - the method here makes use of the dictionary created at the start, whereas the function below reanalyses a specific email. More trust should be placed in the function that assigns the topics to an employee than the function below. This function is very experimental and any suggestion are welcome. 

```python
from nltk.stem.wordnet import WordNetLemmatizer
wordnet_lemmatizer = WordNetLemmatizer()
from collections import defaultdict
import re

doc = ''

def match_words(word):
    word_edit = word.lower()
    try:
        word_edit = tokenizer.tokenize(word_edit)[0]
    except:
        pass
    return wordnet_lemmatizer.lemmatize(word_edit)
    
def build_html_colour(word, topic):
    #return " <font color=" + str(topic_colours[topic]) + "'>" + word + "</font> "
    return ' <span style="background-color: ' + str(topic_colours[topic])  +'">' + word + '</span>'

def read_doc(doc):
    chdir('/path/to/text/files')
    doc = open(str(doc),'r').read()
    
    # Variables so recalculation is not necessary
    doc_split = doc.split()
    
    # Build dictionary of topic's distribution for a given document
    num_topics_weight = 0
    Topics = defaultdict(int)
    for word in doc_split:
        word_edit = match_words(word)
        try:
            word_topics = ldamodel.get_term_topics(word_edit)
            if word_topics:
                for topic in word_topics:
                    Topics[topic[0]] += topic[1]
                    num_topics_weight += topic[1]            
        except:
            pass
    # Find topic info
    # Append Topic, number of words in document from given topic and doc percentage of topic
    Topic_info = []
    for topic in Topics:
        Topic_info.append([topic, Topics[topic], round((Topics[topic]/num_topics_weight)*100)]) 
    
    # Topic info for three most prevalent topics for a given document
    Topic_info_top3 = []
    Topic_info_copy = []
    for i in Topic_info:
        Topic_info_copy.append(i)
    
    for i in range(0,3):
        max = Topic_info_copy[0]
        for topic in Topic_info_copy:
            if topic[2] > max[2]:
                max = topic
        Topic_info_top3.append(max)
        Topic_info_copy.remove(max)
        
    
    # Format the document according to topics
    for word in doc_split:
        word_edit = match_words(word)
        try:
            topic = ldamodel.get_term_topics(word_edit)[0][0]
            if (topic == Topic_info_top3[0][0]) or (topic == Topic_info_top3[1][0]) or (topic == Topic_info_top3[2][0]):
                doc = doc.replace( ' ' + word + '', build_html_colour(word,topic))
                #doc = doc.replace( '' + word + ' ', build_html_colour(word,topic))
        except:
            pass
    doc = re.sub(r'\n','<br>',doc)
    
    Output = []
    for item in Topic_info_top3:
        colour = build_html_colour('Topic ' + str(item[0]), item[0])
        topic_info = colour + ': ' + str(item[2]) + '% ' + str(Topic_words[item[0]])
        Output.append(topic_info)
    return Output, doc
```

HTML is used to add colour to the printed text. See [here](https://jakevdp.github.io/blog/2013/06/01/ipython-notebook-javascript-python-communication/) for more information. Note that the function above and the HTML implementation below was created for use within the Jupyter Notebook. Also make sure to change the directory in the function above to point to where the email to be analysed is stored. Below, assign the name of the file to the variable `doc`.  The 3rd email by **dickson-s** has been used as an example here. 

```python
#Input the document we want to read
doc = 'dickson-s_3.'

from IPython.display import HTML

input_form = """
<div style="background-color:white; border:solid black; width:1100px; padding:20px;">
<p>"""+read_doc(doc)[0][0]+"""</p>
<p>"""+read_doc(doc)[0][1]+"""</p>
<p>"""+read_doc(doc)[0][2]+"""</p>
<p>"""+read_doc(doc)[1]+"""</p>
</div>
"""

HTML(input_form)
```
![alt tag](https://cloud.githubusercontent.com/assets/20296112/16767476/f1fa662e-483f-11e6-9bc3-e5d81ea16d4d.png)

Below, we create two functions, namely, `get_person_topics()` and `get_topic_persons()`.

`get_person_topics()` takes in a specific person as a string and returns a dictionary with a ratio value (out of 1) for each of the 20 topics. This indicates the prevalance of each of the topics as a percentage for a given person.

`get_topic_persons()` takes in a topic as an integer and returns a dictionary with a ratio value (out of 1) for all the employees. This indicates which employees fall under a specific topic. 

```python
from collections import defaultdict

def get_person_topics(person):
    person_topics = defaultdict(int)
    total = 0
    for word in docs_name_dict[person]:
        try:
            term_topics = ldamodel.get_term_topics(word)
            if term_topics:
                for topic_tuple in term_topics:
                    person_topics[topic_tuple[0]] += topic_tuple[1]
                    total += topic_tuple[1]
        except:
            pass
        
    #scale the values
    for person in person_topics:
        person_topics[person] = person_topics[person]/total
    return person_topics

def get_topic_persons(topic):
    specific_topic_persons = defaultdict(int)
    
    total = 0
    for person in docs_name_dict:
        person_topics = get_person_topics(person)
        person_value = person_topics[topic]
        specific_topic_persons[person] += person_value
        total += person_value
    
    
    #Scale the numbers in the dictionary to a percentage
    for person in docs_name_dict:
        specific_topic_persons[person] = specific_topic_persons[person]/total
        
    return specific_topic_persons
```
We now see which person falls under a given topic the 'most' as well as which topic falls under a given person the 'most'. With some experimentation, it seems that the data normalises given the large number of emails and fairly large number of employees.

```python
# Finding top person for a given topic

topic_person = get_topic_persons(10)
maximum_person = max(topic_person.keys(), key=(lambda key: topic_person[key]))
print(maximum_person, '{0:.2%}'.format(topic_person[maximum_person]))
```
```python
# Finding top topic for a given person

person_topic = get_person_topics('allen-p')
maximum_topic = max(person_topic.keys(), key=(lambda key: person_topic[key]))
print(maximum_topic, '{0:.2%}'.format(person_topic[maximum_topic]))
```

To see the data visualised, click [here](http://peter-thompson.github.io), where each circle represents an employee. The size of the bubbles are determined by the number of relevant words used by each employee. Upon clicking on a specific employee, a donut chart appears that shows the topic distribution for the given employee. This is determined by using the above function `get_person_topics()`. Further, if one clicks on a given topic, a few key words for that topic appears. 

The visualisation was done using D3. It must be noted that the code is available, HOWEVER, some unfortunate hardcoding has taken place. The code is thus fairly tailored for 20 topics (and is all but neatly laid out). 
