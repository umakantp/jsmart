{html_table loop=$a}

{html_table loop=$a inner=rows}

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

{html_table loop=$a inner=rows vdir=up hdir=left}

--------------------------------------------------
--------------------------------------------------
{$colNames = ['Col1','Col2','Col3']}
{html_table loop=$a cols=$colNames}