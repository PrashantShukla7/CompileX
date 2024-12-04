export const LANGUAGE_VERSIONS = {
    "javascript": "1.32.3",
    "java": "15.0.2",   
    "cpp": "10.2.0",
    "c": "10.2.0",
    "python": "3.10.0",
    "kotlin" : "1.8.20",
    "csharp" : "6.12.0",
    "php" : "8.2.3",
    "rust": "1.68.2"
}

export const LANGUAGE_BOILERPLATES = {
    java: `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`,
    javascript: `// Your code here
console.log("Hello, World!");`,
    c: `#include <stdio.h>

int main() {
    // Your code here
    printf("Hello, World!\\n");
    return 0;
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
    python: `# Your code here
print("Hello, World!")`,
kotlin: `fun main() {
    println("Hello, World!")
}
`,
    csharp: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Hello, World!");
    }
}
`,
rust: `fn main() {
    println!("Hello, World!");
}
`,
php: `<?php
echo "Hello, World!";
?>
`

};
