
How to use it!

* http://bos1r13lg03d:8084/viewxpath?xpath=LogParser[0].custom
	* This is the Neverwinter log parser, which you get by doing this:
		* http://neverwinter:8086/viewxpath?xpath=ClusterController[0].custom
		* Click on Neverwinter_LogParser's Monitor link.
* (top level) Commands -> Launchstandalone
	* Click "Local link"
* Under Standaloneoptions
	* Commands->Begincreatingfilteredfile
		* Go!
	* Commands->Compressfilteredfile
		* Go!
	* Commands -> Setdatestosearch_utclogdate
		* Fill as appropriate.
	* Please note, none of this is my fault. I am not responsible for the usability of any of this.
	* Commands-> Setfilenametomatch
		* GATEWAY_PROXY
	* Commands->Setsubstringrestriction
		* ClientSessionStats
* (Top level) Commands-> Scannow
	* OK or whatever
* Wait
* Eventually, you'll get the same screen as before to pop up.
* RIGHT-CLICK Download Filtered Log File, Save As.
	* If you left click it will close your logparser session which is a pain if you want to do another one.
* Download the file. It may be slow because it's in Boston. Which is why we compressed it.
* Decompress the file, perhaps by opening it in 7Zip and dragging the file out.

Congratulations, you now have a source file to process into a CSV.

* Get the Gateway src with SVN. If you don't have this, then you are boned and you can get it from Shannon.
* Make a directory somewhere for all the poop you're about to make.
* Run C:\src\gateway\bin\delog <full path to log file>
	* For example:
		* c:\bin\gateway\bin\delog C:\Users\sposniewski\Desktop\FilteredLogs_4.txt
* Watch it print out lots of dots. If you have a really big file, this can take a while.
* As it's running, dated csv files will be created.
* At the end, a user.csv will be created.
* PROFIT!

