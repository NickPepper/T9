//package net.pramodb.t9.main;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

// Implements the T9 predictive text input by pre-processing the 
// input word dictionary into buckets based on the keypad
public class PreSorted {
	
	public static void main(String[] args) {
		//path to dictionary file
		String dictFile = "c:/pramod/myworkspace/T9/morewords.txt";
		
		//word for which keypad equivalents have to be found
		String word = "blade";
		
		//no. of dictionary words to pre-process
		int preprocessCount = 200000;		
		
		WordBuckets wb = new WordBuckets(dictFile);
		try {
		    wb.init();		
		    wb.loadWordsFromDict(preprocessCount);
		    wb.addWord("cnz"); //illustrates adding non-dictionary words

		    long startMatch = System.currentTimeMillis();
		    System.out.println("Matches for word: "+word+" "+wb.getMatches(word));
		    System.out.println("match time:"+(System.currentTimeMillis()-startMatch));
		    
		} catch(FileNotFoundException e) {
			System.out.println("Could not find dict: " + dictFile);			
			e.printStackTrace();
			
		} catch(IOException e) {
			System.out.println("Error loading dict: " + dictFile);			
			e.printStackTrace();
		}
	}
}

//methods to split the dictionary into buckets based on keypad,
//find matches for a given key sequence and add words to the wordlist 
class WordBuckets{
	
    //String(concatenated bucketid of each char in the word) -> List of strings	
	Map bucketedWords = new HashMap(); 
	
	Map charBuckets = new HashMap(); //char -> int (bucketid)
	List dict = new ArrayList(); //list of all dictionary words
	
	private static final String[] buckets = {"abc","def", "ghi", "jkl", "mno", 
		                                     "pqrs", "tuv", "wxyz"};	
	private String dictFile;	
	
	WordBuckets(String dictFile){
		this.dictFile = dictFile;
	}
	
	public void init() throws FileNotFoundException, IOException{
        for(int i=0;i<buckets.length;i++){
        	String word = buckets[i];
        	for(int j=0;j<word.length();j++){
        		charBuckets.put(new Character(word.charAt(j)),new Integer(i));
        	}
        }
        loadDict();
	}
	
	public List getMatches(String word){
		List matches = new ArrayList();
		String key = getKeyForWord(word);
		if(key != null){
			if(bucketedWords.containsKey(key)){
		        matches = (List)bucketedWords.get(key);		
			}
		}
		return matches;
	}
	
	public void loadWordsFromDict(int wordCount){
        for(Iterator it=dict.iterator();it.hasNext() && wordCount>0;){
        	String word = (String)it.next();
        	addWord(word);
        	wordCount--;
        }
	}
	
	public void addWord(String word){
		String key = getKeyForWord(word);
		if(key != null){
		    if(!bucketedWords.containsKey(key)){
		    	bucketedWords.put(key, new ArrayList());
		    }
	    	((List)bucketedWords.get(key)).add(word);	    
		}
	}	
 
	private String getKeyForWord(String word){
		String key = "";
		boolean isValidWord = true;
	    for(int i=0;i<word.length() && isValidWord;i++){
	        char ch = word.charAt(i);
	        if(charBuckets.containsKey(new Character(ch))){
		        Object keynum = charBuckets.get(new Character(ch));
		        key = key + ((Integer)keynum).toString();
	        }else{
	            key = null;
	            isValidWord = false;
	        }
	    }
	    return key;
	}
	
	private void loadDict() throws FileNotFoundException, IOException{
		FileReader fr = null;
		try{
			fr = new FileReader(dictFile);
			BufferedReader br = new BufferedReader(fr);
			String line;
			while((line=br.readLine()) != null){
				line = line.trim();
				dict.add(line);
			}
		}finally{
			if(fr != null){
				try{
					fr.close();
				}catch(IOException e){
					
				}
			}
		}
	}
}
