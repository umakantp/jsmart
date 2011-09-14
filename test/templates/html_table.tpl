{html_table loop=$a}

{html_table loop=$a inner=rows tr_attr=['class="odd",class="even"']}

{$people = ['Joe Schmoe', 'Charlie Brown', 'Jack Smith']}
{html_table loop=$people}

-------------- vdir=up -----------------
{html_table loop=$a vdir=up}

{html_table loop=$a inner=rows vdir=up}

-------------- hdir=left -----------------
{html_table loop=$a hdir=left}

{html_table loop=$a inner=rows hdir=left}

-------------- vdir=up hdir=left -----------------
{html_table loop=$a vdir=up hdir=left}

{html_table loop=$a inner=rows vdir=up hdir=left td_attr=['a=11','a=22','a=33']}

--------------------------------------------------
--------------------------------------------------
{$colNames = ['Col1','Col2','Col3']}
{html_table loop=$a cols=$colNames caption='My Table' th_attr=['attr=aa','attr1=bb','attr=cc']}

{html_table loop=$a cols='col1,col2,col3' table_attr="id='myTbl' class='mytbl'" th_attr='zz=yy' tr_attr="class='mytr'" td_attr="class='mytd'"}

{html_table loop=$a rows=2}

{html_table loop=$a cols=2 rows=2}

{html_table loop=$a cols=4 rows=5}

{html_table loop=$a vdir=up hdir=left cols=$colNames}