<script type="text/javascript">
$(document).ready(function() {
    $('#account-tabs').tabs();
});
</script>

<style>
img.check
{
width:15px;
height:19px;
background:url("../img/checkbox.gif") 0 19px;
}
img.uncheck
{
width:15px;
height:19px;
background:url("../img/checkbox.gif") 0 0;
}
</style>

<?cs if:Pagetitle ?>

<form method="get" action="find.html">

       
            <label for="svn">SVN ID:</label>
			<input type="text" name="svnID" value=""
                title="SVN ID"  id="svnField"/>
				<br>
			<label for="gimme">Gimme ID:</label>
			<input type="text" name="gimmeID" value=""
                title="Gimme ID" id="gimmeNumField"/>
			<label for="gimme">Gimme Product and Branch:</label>
			<input type="text" name="gimmeBranch" value="" id="gimmeBranchField"
                title="Gimme Product and Branch (Ex: Night Branch 5)"/>

    <fieldset>
        <div class="rowElem">
            <input class="submit" type="submit" value="Find it!" />
        </div>
    </fieldset>
</form>

<script>
var svnNum = /[&?]svnID=([^&]+)/.exec(location.search);
if (svnNum)
    document.getElementById('svnField').value = svnNum[1];
var gimmeNum = /[&?]gimmeID=([^&]+)/.exec(location.search);
if (gimmeNum)
    document.getElementById('gimmeNumField').value = gimmeNum[1];
var gimmeBranch = /[&?]gimmeBranch=([^&]+)/.exec(location.search);
if (gimmeBranch)
    document.getElementById('gimmeBranchField').value = gimmeBranch[1].split('+').join(' ');

function showBuiltHelp() {
	alert("This table will tell you whether a revision has gone through certain builder types.\nThe left column gives the builder type, and the right column displays the first known build of that type, featuring the requested revision.");
}

function showDeployHelp() {
	alert("This table will tell you whether a revision has\ngone live somewhere, or to any QA or Dev servers.\n\nThe left column identifies the server's type, with a prefix\nspecifying the 'liveness' of the deployment.\n\nThe right two columns give the first known appearance\nof the requested revision by the machine name and date/time first seen by RevisionFinder.");
}

</script>

<h2><?cs var:Pagetitle ?></h2>

<h3><a href="javascript:showBuiltHelp();">Standard build types: </a></h3>
	<table border="1">
		<tr>
			<th>Builder Type</th>
			<th></th>
			<th colspan="2">First Known Build</th>
		</tr>
		<?cs each:sortedBuildType = Sortedbuildtypes ?>
		<tr>
			<td><?cs var:sortedBuildType.Buildtypename ?></td>
				<?cs if:sortedBuildType.Exists == 1 ?>
				<td style="color: #007700; background-color: #00ff00">✔</td>
				<td><?cs var:sortedBuildType.Buildinfo.Machinename ?></td>
				<td><?cs var:sortedBuildType.Buildinfo.Buildstarttime ?></td>
				<?cs else ?>
					<td style="color: #770000; background-color: #ff0000">X</td>
				<?cs /if  ?>
		</tr>
		<?cs /each ?>
	</table>

	<?cs if:subcount(Buildtypes) ?>
		<h4> This revision has also been through the following build types: </h4>
			<ul>
				<?cs each:buildType = Buildtypes ?>
					<li><?cs var:buildType ?></li>
				<?cs /each ?>
			</ul>
	<?cs /if ?>
<br>
<?cs if:subcount(Shardtypes) ?>
	<h3><a href="javascript:showDeployHelp();">Deployment types:</a></h3>
	<table border="1">
	<tr>
			<th>Server Type</th>
			<th colspan="2">First Known Deployment</th>
		</tr>
	<?cs each:shardType = Shardtypes ?>
	<tr>
		<td>
			<?cs var:shardType.shardType ?>
		</td>
		<td>
			<?cs var:shardType.shardName ?>
		</td>
		<td>
			<?cs var:shardType.StartTime ?>
		</td>
	</tr>
	<?cs /each ?>
	</table>
<?cs /if ?>
<br>
<div id="account-tabs">
	
	
    <div id="general-tab">

		<table class="tablesorter">
			<caption>Deployment Information for <?cs var:Pagetitle ?></caption>
			<thead>
				<tr>
					<th title="Time first seen by Revision Finder">Time First Seen</th>
					<th>Deployment Shard</th>
					<th>Patch</th>
					<th>Built revision</th>
					<th>Builder Name</th>
					<th> SVN Branch </th>
					<th>Gimme Product Name/Branch</th>
				</tr>
			</thead>
			<tbody>
				<?cs each:entry = Buildinfos ?>
				<?cs if:subcount(entry.Deployinfo.Deployments) ?>
				<?cs each:deployment = entry.Deployinfo.Deployments ?>
					
					<tr>
					<td>
						<?cs if:deployment.StartTime ?>
							<?cs var:deployment.StartTime ?>
						<?cs else ?>
							<?cs var:entry.Buildstarttime ?>
						<?cs /if ?>
					</td>
					<td><?cs var:deployment.shardName ?></td>
					<td><?cs var:entry.Deployinfo.Patchname ?></td>
					<td><?cs var:entry.Revisionnumber ?></td>
					<td><?cs var:entry.Machinename ?></td>
					<td><?cs var:entry.Svnbranchname ?></td>
					<td><?cs var:entry.Buildinfo.Presumedgimmeproductandbranch ?></td>
					</tr>
					<?cs /each ?>
				<?cs /if ?>
				<?cs /each ?>
			</tbody>
		</table>
    </div>
</div>
<?cs else?>

<form method="get" action="findRevision/find.html">

       
            <label for="svn">SVN ID:</label>
			<input type="text" name="svnID" value=""
                title="SVN ID" />
				<br>
			<label for="gimme">Gimme ID:</label>
			<input type="text" name="gimmeID" value=""
                title="Gimme ID"/>
			<label for="gimme">Gimme Product and Branch:</label>
			<input type="text" name="gimmeBranch" value=""
                title="Gimme Product and Branch (Ex: Night Branch 5)"/>

    <fieldset>
        <div class="rowElem">
            <input class="submit" type="submit" value="Find it!" />
        </div>
    </fieldset>
</form>

<?cs /if ?>
