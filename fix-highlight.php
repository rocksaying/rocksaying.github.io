<?php
// <script type="syntaxhighlighter" class="brush: php"><![CDATA[
// {% highlight %}

// ]]></script>
// {% endhighlight %}

// <pre class="language-term">
// </pre>
// <pre><code class="language-term">
// </code></pre>

// ```text
// <pre class="language-text"></pre>
// or
// <div class="language-text highlighter-rouge"><div class="highlight"><pre class="highlight"><code>
// </code></pre></div></div>

const TERM_BEGIN = '<pre class="language-term">';
const TERM_END = '</pre>';

const HIGHLIGHT_BEGIN = '<pre class="highlight"><code>';
const HIGHLIGHT_END = '</code></pre>';

$patterns = ['/<span class="\w+">/', '/<\/span>/'];  
$replacements = ['', ''];

if (count($argv) < 2) {
    echo "Usage: filename [highlight_language]\n";
    exit(0);
}

$filename = $argv[1];
$lang = (isset($argv[2]) ? $argv[2] : "");

$contents = file_get_contents($filename);


$curpos = 0;
$endpos = strlen($contents);
$highlight_begin = 0;
$output = array();
while ($curpos < $endpos) {
    $highlight_begin = strpos($contents, HIGHLIGHT_BEGIN, $curpos);
    if ($highlight_begin > 0) {
        $tmp = substr($contents, $curpos, $highlight_begin - $curpos);
        $output[] = $tmp;
        $output[] = "\n{% highlight ${lang} %}\n";

        $curpos = $highlight_begin + strlen(HIGHLIGHT_BEGIN);
        $highlight_end = strpos($contents, HIGHLIGHT_END, $curpos);

        $code = substr($contents, $curpos, $highlight_end - $curpos);
        
        $tmp = html_entity_decode(trim(preg_replace($patterns, $replacements, $code)));
        // echo $tmp;
        $output[] = $tmp;

        // echo "\n{% endhighlight %}";
        $output[] = "\n{% endhighlight %}";
        $curpos = $highlight_end + strlen(HIGHLIGHT_END);
    }
    else {
        $tmp = substr($contents, $curpos);
        // echo $tmp;
        $output[] = $tmp;
        break;
    }
}


$contents = implode('', $output);

$curpos = 0;
$endpos = strlen($contents);
$highlight_begin = 0;
$output = array();
while ($curpos < $endpos) {
    $highlight_begin = strpos($contents, TERM_BEGIN, $curpos);
    if ($highlight_begin > 0) {
        $tmp = substr($contents, $curpos, $highlight_begin - $curpos);
        // echo $tmp;
        $output[] = $tmp;
        // echo "\n{% highlight ${lang} %}\n";
        $output[] = '<pre><code class="language-term">';

        $curpos = $highlight_begin + strlen(TERM_BEGIN);
        $highlight_end = strpos($contents, TERM_END, $curpos);

        $code = substr($contents, $curpos, $highlight_end - $curpos);
        
        $tmp = html_entity_decode($code);
        $output[] = $tmp;

        $output[] = '</code></pre>';
        $curpos = $highlight_end + strlen(TERM_END);
    }
    else {
        $tmp = substr($contents, $curpos);
        // echo $tmp;
        $output[] = $tmp;
        break;
    }
}

file_put_contents($filename, implode('', $output));
?>