<div class="ui-widget">
    <div class="ui-corner-all ui-state-<?cs var:Type ?>" style="margin-top: 20px; margin-bottom: 20px; padding: 0 .7em;"> 
        <p>
            <span class="ui-icon ui-icon-<?cs if:Type == "error" ?>alert<?cs else ?>info<?cs /if ?>" style="float: left; margin-right: .3em;"></span>
            <strong><?cs var:Subject ?>:</strong>
            <?cs var:Message ?>
            <?cs if:Referer ?>
            <a class="back" href="<?cs var:Referer ?>">[return]</a>
            <?cs /if ?>
        </p>
    </div>
</div>
