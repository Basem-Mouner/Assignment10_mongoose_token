"use strick"


/*
Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".

 

Example 1:

Input: strs = ["flower","flow","flight"]
Output: "fl"
Example 2:

Input: strs = ["dog","raceway","car"]
Output: ""
Explanation: There is no common prefix among the input strings.
*/

function longestCommonPrefix(strs) {
  if (strs.length === 0) return "no inputs string";

  // Start with the first string as the initial prefix
  let prefix = strs[0];
  // Compare the prefix with each string
    for (let i = 1; i < strs.length; i++) {
    
    // Shrink the prefix until it matches the start of strs[i]
      while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === "") return "There is no common prefix among the input strings.";
    }
  }

  return prefix;
}

// Example usage
console.log(longestCommonPrefix([])); // Output: ""
console.log(longestCommonPrefix(["flower", "flow", "flight"])); // Output: "fl"
console.log(longestCommonPrefix(["dog", "raceway", "car"])); // Output: ""
