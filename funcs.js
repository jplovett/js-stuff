const otPath = window.location.pathname;
const otPage = otPath.split("/").pop();
let otCurrUser = {
    userID: 0,
    userEmail: "",
    userName: "",
    isStaffAdmin: false
};
let otPageTitle;

window.addEventListener('unload', function () {
    SetFullScreenMode(false);
});

window.addEventListener('load', function () {
    SetFullScreenMode(true);
});

jQuery(document).ready(function () {
    console.info("doc ready");
    //otPageTitle = otPage.substring(0, otPage.length - 5).replace(/-/g, " "); 
    //> chop off the file extension and replace dashes or %20 with a space
    jQuery("#reNav").load("https://website/SiteAssets/cewp/OT/reNav.html");
});
SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
    console.info("Initiating SP.ClientContext");
    const otPageTitle = "On-TRAC:" + otPage.replaceAll('-', ' ').substring(0, otPage.length - 5);
    console.info(otPageTitle);
    document.title = otPageTitle;
});
SP.SOD.executeOrDelayUntilScriptLoaded(ClientContextLoaded, "sp.js");

function ClientContextLoaded() {
    IsCurrentUserOTStaff(function (result) {
        if (result) {
            jQuery(".spShowHide").show();
            jQuery(".adminBtn").show();
        }
    });
}

function IsCurrentUserOTStaff(OnComplete) {

    let ctx = new SP.ClientContext.get_current();
    let currentWeb = ctx.get_web();

    let otWebCurrUser = ctx.get_web().get_currentUser();
    ctx.load(otWebCurrUser);

    let allGroups = currentWeb.get_siteGroups();
    ctx.load(allGroups);

    // staff admin group
    let group = allGroups.getByName("DSLR_On-TRAC_Owners");
    ctx.load(group);

    let groupUsers = group.get_users();
    ctx.load(groupUsers);

    //Console out all the lists for this SP Site, part 1
    //let lst = currentWeb.get_lists();
    //ctx.load(lst);

    ctx.executeQueryAsync(OnSuccess, OnFailure);

    function OnSuccess() {
        let userInGroup = false;
        let groupUserEnumerator = groupUsers.getEnumerator();
        while (groupUserEnumerator.moveNext()) {
            otCurrUser.userID = 0;
            let groupUser = groupUserEnumerator.get_current();
            //set current user props before checking if in group
            otCurrUser.userID = otWebCurrUser.get_id();
            const userTitle = otWebCurrUser.get_title().split(" (");
            otCurrUser.userName = userTitle[0].trim();
            otCurrUser.userEmail = userTitle[1].substr(0, (userTitle[1].length - 1)).toLowerCase();

            // check if user cdc On-TRAC admin user
            if (groupUser.get_id() == otWebCurrUser.get_id()) {
                otCurrUser.isStaffAdmin = true;
                userInGroup = true;
                break;
            }
        }

        //Console out all the lists for this SP Site, part 2
        //let em = lst.getEnumerator();
        //for (i = 0; i < lst.get_count(); i++) { console.log(em.$8_0[i].get_title()) }

        // log user page visit - when each page is opened
        logUserActivity(otCurrUser.userEmail, otCurrUser.userID, 'Opened ' + otPageTitle + ' page');

        if (otCurrUser.isStaffAdmin) {
            jQuery("#AdminMenu").load("https://website/SiteAssets/cewp/OT/adminNav.html");
        }
        // function to run on every OT page after current user has been checked
        pageFunc();
        // show admin buttons & links if user OT admin/dev
        OnComplete(userInGroup);
    }

    function OnFailure() {
        OnComplete(false);
    }
}

function getItems(url, success) {
    jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle" + url,
        type: "GET",
        async: false,
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function (data) {
            success(data.d.results);
        },
        error: function () {
            console.error("getItems function error! (Check columns name/case and the list name format");
        }
    });
}

function logUserActivity(uEmail, uID, Title) {
    //specify item properties
    let itemProperties = { 'Title': Title, 'SiteUserEmail': uEmail, 'SiteUserID': parseInt(uID) };
    //create item
    createListItem('SiteUserActivity', itemProperties,
        function (entity) {
            //console.info(entity);
        },
        function (error) {
            console.error("logUserActivity function error!");
            console.error(JSON.stringify(error));
        }
    );
}

function createListItem(listName, itemProperties, success) {

    let itemType = getItemTypeForListName(listName);
    itemProperties["__metadata"] = { "type": itemType };

    jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(itemProperties),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            success(data.d);
        },
        error: function (error) {
            console.error("createListItem function error!");
            console.error(JSON.stringify(error));
        }
    });
}

// Get List Item Type metadata
function getItemTypeForListName(name) {
    return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
}

function getSearchParams(k) {
    var p = {};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) { p[k] = v })
    return k ? p[k] : p;
}

function getCheckboxValue(cbxValue) {
    return (cbxValue ? true : false);
}

// use a - (minus) in front of the property for sorting desending
function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function deleteDocLibFile(libTitle, fileID) {
    if (confirm('Are you sure you want to delete this document? (ID: ' + fileID + ')')) {
        jQuery.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + libTitle + "')/items(" + fileID + ")",
            type: "POST",
            async: false,
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-Http-Method": "DELETE",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "If-Match": "*"
            },
            success: function (data) {
                return data;
            },
            error: function (data) {
                alert("Failed to delete document: " + fileID);
                console.error('File delete request from SP list ' + libTitle + 'failed.');
            }
        });
    } else {
        // Do nothing!
        console.info('Delete request was canceled.');
    }

}

function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > -1) {
        return true
    } else if (navigator.userAgent.match(/Trident.*rv\:11\./)) {
        return true;
    } else {
        return false;
    }
}

function getUserTitle(id) {
    let userTitle = "";
    getUser(id,
        function (props) {
            let n = props[0].Title.indexOf(" (");
            if (n != -1) {
                userTitle = props[0].Title.substring(0, n).trim().capitalize();
            } else {
                userTitle = props[0].Title;
            }
        },
        function () {
            console.error("Error finding SP user data!");
            userTitle = null;
        });
    return userTitle;
}

function getUser(id, success) {
    jQuery.ajax({
        url: apiUrl + "/web/siteusers?$filter=Id eq " + id,
        type: "GET",
        async: false,
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function(data) {
            success(data.d.results);
        },
        error: function(error) {
            console.error("getUser function error!");
            console.error(JSON.stringify(error));
        }
    });
}

function getItemsArray(data) {
    if (data.d.results.length > 0) {
        return data.d.results;
    }
    else {
        return "";
    }
}
function getItemsTable(data, tableName) {
    let fullresult = "<table id='" + tableName + "'><thead><tr><th>ID</th><th>Description</th></tr></thead>";
    if (data.d.results.length > 0) {
        var results = data.d.results;
        for (var i = 0; i < results.length; i++) {
            fullresult += "<tr><td>" + results[i].ID + "</td><td>" + results[i].Descrip + '</td></tr>';
        }
        return fullresult += "</table>";
    }
    else {
        return "No Data Found in List!";
    }
}
function getItemsFail(err) {
    alert(responseText);
    console.error(err);
}

//capitalize first letter of words
String.prototype.capitalize = function () {
    return this.toLowerCase().replace(/\b\w/g, function (m) {
        return m.toUpperCase();
    });
};
