module.exports = {
    "rules": {
        
        "quotes": [
            2,
            "single"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "always"
        ]
    },
    "globals": {
        "require": true,
        "module": true,
        "__dirname": true,
        "__filename": true,
        "process": true,
        "Buffer": true
   },
    "env": {
        "es6": true,
        "browser": true
    },
    "extends": "eslint:recommended"
};
