let lessonSource = process.argv[2];
let target_dir = process.argv[3];
let generate_beta_content = process.argv.length >= 4 && process.argv[4]=="beta";

const fs = require('fs');
let showdown = require("./showdown.js");
converter = new showdown.Converter();

let lessons = JSON.parse(fs.readFileSync(lessonSource));

function getWord(words,lang,w){
    if(words[lang][w]){
        return words[lang][w];
    }
    return words["en"][w];
}

function template(lessons,lang,title,code,content,index,isLast, words, is_beta){
    return `<html lang="en">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-155199982-2"></script>
        <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-155199982-2');
        </script>
        <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
        <meta content="utf-8" http-equiv="encoding">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
        <title>Robot Psychology - Empathy for Machines</title>
        <link rel="stylesheet" href="blog.css">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.0.3/build/styles/pojoaque.min.css">
        <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3/highlight.min.js"></script>
    </head>
    <body>
        <div class="blog">
            <div class="header">
                <a href="index.html">ROBOT PSYCHOLOGY</a></span>
                <span class="nav">
                <span class="subscribe"><a href="subscribe.html">subscribe</a></span>
            </div>
            <div class="page">
            <img src="images/000.png">
            <h1>${title}</h1>
            ${content}
        </div>
        <div class="side-tag">
            XBA-4281
            <div class="bar-code">empathy for the machine</div>
        </div>
    </body>
</html>`
}

function pad(num, size) {
    var s = num+"";
    return s.padStart(2, '0')
}

function getFileName(lang,i,is_beta){
    let fileName = "article_"+pad(i,2)+`_${lang}.html`;
    return fileName;
}

let languages = Object.keys(lessons.articles[0]);

for(var l in languages){
    let lang = languages[l];
    let c = 0;
    let words = lessons.common_words;
    let langLessons = lessons.articles.filter(x=>{
        if(!generate_beta_content && x.beta == true){
            return false;
        }
        return true;
    });
    let betaLessons = lessons.articles.filter(x=>{
        return true;
    });
    for(var i in langLessons){
        let lesson = langLessons[i];
        let fileName = getFileName(lang,i,false);
       
        let lesson_title = lesson["en"].title;
        let lesson_content = converter.makeHtml(lesson["en"].content_markdown)
        let lesson_code = lesson["en"].code 
        if(lesson[lang]){
            let target_lang = lang;
            if(lesson[lang].clone){
                target_lang = lesson[lang].clone;
            }
            lesson_title = lesson[target_lang].title;
            lesson_content =  converter.makeHtml(lesson[target_lang]["content_markdown"]);
            lesson_code = lesson[target_lang].code || lesson["en"].code;

            if(lesson[lang].clone){ 
                if(lesson[lang].code){
                    lesson_code = lesson[lang].code;
                }
            }
        }
        
        fs.writeFileSync(target_dir+"/"+fileName, template(langLessons, lang,lesson_title,lesson_code,lesson_content,c,i==langLessons.length-1,words,false))
        c++;
    }
    c = 0;
    for(var i in betaLessons){
        let lesson = betaLessons[i];
        if(lesson[lang]){
            let target_lang = lang;
            if(lesson[lang].clone){
                target_lang = lesson[lang].clone;
            }
            let fileName = getFileName(lang,i,true);
       
            let lesson_title = lesson["en"].title;
            let lesson_content = lesson["en"].content_markdown
            let lesson_code = lesson["en"].code 
            if(lesson[target_lang]){
                lesson_title = lesson[target_lang].title;
                lesson_content = converter.makeHtml(lesson[target_lang]["content_markdown"]);;
                lesson_code = lesson[target_lang].code || lesson["en"].code;
            }
            fs.writeFileSync(target_dir+"/beta_"+fileName, template(betaLessons, lang, lesson_title,lesson_code,lesson_content,c,i==betaLessons.length-1,words,true))
            c++;
        }
    }
}