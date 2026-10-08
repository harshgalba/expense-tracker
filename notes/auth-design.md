We wil use JWT authorization design.

Why? - Since this is personal project, the scope does not include large scale commercial use. 

With JWT the whole mechanism is visible. Token can be pasted into Thunder Client directly, which makes it easier to learn. As opposed to sessions, which hide more of the work inside cookies.

The tradeoff being that a JWT is signed, not encrypted. So anyone holding the token can read what's inside it, but they can't change it without breaking the signature. 