//Creacion de variables de acceso público
var context;
var web;
var user;
var currentItem;
var hostweburl;
var appweburl;
var title;

$(document).ready(function () {
    appweburl = GetAppSiteUrl();
    hostweburl = GetHostSiteUrl();

    var scriptbase = hostweburl + "/_layouts/15/";
    $.getScript(scriptbase + "SP.RequestExecutor.js");

    var clientContext = new SP.ClientContext.get_current();
    var parentCtx = new SP.AppContextSite(clientContext, hostweburl);
    var web = parentCtx.get_web();
    clientContext.load(web);
    var listId = GetListId();
    list = web.get_lists().getById(listId);
    clientContext.load(list);
    var itemId = GetItemId();
    currentItem = list.getItemById(itemId);
    clientContext.load(currentItem);
    clientContext.executeQueryAsync(onListLoadSucceeded, onRequestFailed);
});
  
function onListLoadSucceeded() {
    title = currentItem.get_fieldValues().Name;
    getSearchResults(title);
}

function onRequestFailed(sender,args) {
    alert('Error:' + args.get_message());
}

//Función para realizar la búsqueda en la lista por el nombre del documento y carga la información en una capa
function DoSearch() {
    var query = $('#txtSearch').val();
    getSearchResults(query);
}
//Funcion para obteenr los resultados de la busqueda (la llamada a la API)
function getSearchResults(queryText) {
    $('#search-title').text('Resultados para la busqueda[' + queryText + ']');

    var searchUrl = appweburl + "/_api/search/query?querytext='" + queryText + "'&trimduplicates=false";
    var executor = new SP.RequestExecutor(appweburl);
    executor.executeAsync({
        url: searchUrl,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: onGetSearchResultsSuccess,
        error: onGetSearchResultsFail
    });
}
//Funcion para cuando la busqueda es satisfactoria
function onGetSearchResultsSuccess(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
    if (results.length == 0) {
        $('#search-results').text('No se han encontrado coincidencias');
    } else {
        var searchResultsHtml = '';
        $.each(results, function(index, result) {
            searchResultsHtml += "<a target='_blank' href='" + result.Cells.results[6].Value + "'>" + result.Cells.results[6].Value + "</a><br/>";
        });
        $("#search-results").html(searchResultsHtml);
    }
}
//Funcion para cuando la busqueda de datos es erronea
function onGetSearchResultsFail(data,errorCode,errorMessage) {
    $('#search-results').text('Un error ha ocurrido durante la busqueda -' + errorMessage);
}

function getQueryStringParameter(paramToRetrieve) {
    var params = document.URL.split("?")[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}

function GetListId() {
    return decodeURIComponent(getQueryStringParameter("ListID"));
}

function GetHostSiteUrl() {
    return decodeURIComponent(getQueryStringParameter("SPHostUrl"));
}

function GetAppSiteUrl() {
    return decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
}

function GetItemId() {
    return getQueryStringParameter("ItemID");
}


//'use strict';

//ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

//function initializePage()
//{
//    var context = SP.ClientContext.get_current();
//    var user = context.get_web().get_currentUser();

//    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
//    $(document).ready(function () {
//        getUserName();
//    });

//    // This function prepares, loads, and then executes a SharePoint query to get the current users information
//    function getUserName() {
//        context.load(user);
//        context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
//    }

//    // This function is executed if the above call is successful
//    // It replaces the contents of the 'message' element with the user name
//    function onGetUserNameSuccess() {
//        $('#message').text('Hello ' + user.get_title());
//    }

//    // This function is executed if the above call fails
//    function onGetUserNameFail(sender, args) {
//        alert('Failed to get user name. Error:' + args.get_message());
//    }
//}
