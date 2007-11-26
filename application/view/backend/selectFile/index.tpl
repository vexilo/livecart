{includeJs file="library/livecart.js"}
{includeJs file="library/dhtmlxtree/dhtmlXCommon.js"}
{includeJs file="library/dhtmlxtree/dhtmlXTree.js"}
{includeJs file="library/rico/ricobase.js"}
{includeJs file="library/rico/ricoLiveGrid.js"}
{includeJs file="library/ActiveGrid.js"}
{includeJs file="backend/SelectFile.js"}

{includeCss file="library/dhtmlxtree/dhtmlXTree.css"}
{includeCss file="library/ActiveGrid.css"}
{includeCss file="backend/Category.css"}
{includeCss file="backend/SelectFile.css"}

{pageTitle}{t _select_file}{/pageTitle}

{include file="layout/backend/meta.tpl"}

{literal}
<style>
	body
	{
		background-image: none;
	}
</style>
{/literal}

<div id="popupCategoryContainer" class="treeContainer">

	<div id="categoryBrowser" class="treeBrowser"> </div>

</div>

<div id="fileContainer" style="margin-left: 300px;">

    <fieldset class="container activeGridControls">
    	<span class="activeGridItemsCount">
    		<span id="filesCount_0">
    			<span class="rangeCount">{t _listing_files}</span>
    			<span class="notFound">{t _no_files_found}</span>
    		</span>
    	</span>
    </fieldset>

{activeGrid
	prefix="files"
	id=0
	controller="backend.selectFile" action="lists"
	displayedColumns=$displayedColumns
	availableColumns=$availableColumns
	totalCount=0
	filters=$filters
	container="fileContainer"
}

</div>

{literal}
<script type="text/javascript">
	Backend.SelectFile.grid = window.activeGrids['files_0'];
	Backend.SelectFile.grid.ricoGrid.metaData.options.largeBufferSize = 100;

	Backend.SelectFile.links = {};
	Backend.SelectFile.links.categoryRecursiveAutoloading = '{/literal}{link controller=backend.selectFile action=xmlRecursivePath}{literal}';
	Backend.SelectFile.links.categoryAutoloading = '{/literal}{link controller=backend.selectFile action=xmlBranch}{literal}';

	Backend.SelectFile.init();
	Backend.SelectFile.addCategories({/literal}{json array=$root}{literal});
	Backend.SelectFile.addCategories({/literal}{json array=$directoryList}{literal});

	Backend.SelectFile.treeBrowser.setXMLAutoLoading(Backend.SelectFile.links.categoryAutoloading);

	Backend.SelectFile.activeCategoryId = Backend.SelectFile.treeBrowser.getSelectedItemId();
	Backend.SelectFile.initPage();

	Backend.SelectFile.loadBookmarkedCategory();

</script>
{/literal}

</body>
</html>