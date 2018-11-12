/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
//Notice: If typeTable="" this is Master table, If typeTable="Slave" this is Slave table
var PagingSorting = function (listItems, queryOptions, apiControlerName, listName, typeTable) {
    var self = this;
    // create variables entities  and as observableArray - list items in table
    self.entities = ko.observableArray();
    // update entities
    self.updateEntities = function (mainList) {
        self.entities(mainList);
    };
    // call firstTime after load JS
    self.updateEntities(listItems);
    // create full path include app prefix
    var apiControlerN = Global.Variable.urlPrefix + apiControlerName;
    //available pagesize
    var availablePagesizes = [5, 10, 15, 20, 50, 100, 200];
    for (var i = 0; i < availablePagesizes.length; i++) {
        $("#selPageSize" + typeTable).append("<option>" + availablePagesizes[i] + "</option>");
    }
    /*
    for (var i = 0; i < 91; i++) {
        if (i == 5 || i == 10 || (i > 10 && i <= 30) || (i > 30 && i % 5 == 0 && i <= 90)) {
            $("#selPageSize" + typeTable).append(`<option>${i}</option>`);
        }
    }*/
    //refresh elemennts after update viewmodel
    self.refreshSlaveElements = function () {
        //selectpicker in table of Assortment - Header
        $('.sel-pic-table-header').selectpicker({
            style: 'btn btn-sm btn-default',
            width: '100px',
            size: 7
        });
        //selectpicker in table of Assortment - Body
        $('.sel-pic-table-body').selectpicker({
            style: 'asrt-border-none picker-font',
            //style: 'btn btn-sm btn-default',
            width: '110px',
            size: 7
        });
        $('.sel-pic-table-header').selectpicker("refresh");
        $('.sel-pic-table-body').selectpicker("refresh");
        //refhresh detect change pickers in assortment body table
        $('select.sel-pic-table-body').change(function () {
            var id = this.id;
            //identification from status picker
            if (id.search("stat") != -1) {
                var statDid = id.split('stat')[0];
                var columnId = id.split('stat')[1];
                for (var i = 0; i < self.entities().length; i++) {
                    if (self.entities()[i].stationDID == statDid) {
                        for (var j = 0; j < self.entities()[i].assortmentLists.length; j++) {
                            if (self.entities()[i].assortmentLists[j].columnBodyId == columnId) {
                                self.entities()[i].assortmentLists[j].statusChanged = true;
                            }
                        }
                    }
                }
            }
            //identification from vat picker
            if (id.search("vat") != -1) {
                var statDid = id.split('vat')[0];
                var columnId = id.split('vat')[1];
                for (var i = 0; i < self.entities().length; i++) {
                    if (self.entities()[i].stationDID == statDid) {
                        for (var j = 0; j < self.entities()[i].assortmentLists.length; j++) {
                            if (self.entities()[i].assortmentLists[j].columnBodyId == columnId) {
                                self.entities()[i].assortmentLists[j].vatChanged = true;
                            }
                        }
                    }
                }
            }
        });
        //refresh deleted columns and datetime in header
        for (var i = 0; i < self.queryOptions.assortmentHeader().length; i++) {
            //delete
            var columnId = self.queryOptions.assortmentHeader()[i].columnHeaderId;
            if (self.queryOptions.assortmentHeader()[i].operations == AjaxCall.Data.operation.Delete) {
                self.queryOptions.assortmentHeader()[i].operations = AjaxCall.Data.operation.Nothing;
                $('#delete' + columnId).click();
            }
        }
        //refresh datetimepickers
        window.activateDatePickers();
    };
    // universal sender request for sort, next, search, change checkboxov, pagging
    self.sendRequestApi = function (wasNextPrev, runSync) {
        if (wasNextPrev === void 0) { wasNextPrev = false; }
        if (runSync === void 0) { runSync = true; }
        // when was request od sort, next set true to ko.observable
        wasNextPrev ? self.queryOptions.goNextPrev(true) : self.queryOptions.goNextPrev(false);
        //runSync = false;
        // call ajax post with parameters
        ajaxCallRestSrv.postWebApi(getqueryOpt(), true, apiControlerN, listName, dataOK, null, null, runSync);
        //refresh items in slave tabe
        function dataOK(data) {
            // update mainList
            self.updateEntities(data.results);
            // update queryOptions
            self.updateQueryOptions(data.queryOptions);
            //refresh selectpickers, datepickers styles
            if (typeTable == 'Slave') {
                self.refreshSlaveElements();
            }
        }
    };
    //called from AssortmentViewModel
    self.SendData = function () {
        self.sendRequestApi();
    };
    // startup pageSize
    $("#selPageSize" + typeTable).val(queryOptions.pageSize);
    // refresh page after change number of rows in table
    $("#selPageSize" + typeTable).on("change", function () {
        var idxPageSize = $("#selPageSize" + typeTable).val();
        self.queryOptions.pageSize(idxPageSize);
        Logger.send(LogLevel.Info, "PagingService.ts", "Change number of rows on  " + idxPageSize + " in " + listName + " - OK");
        self.sendRequestApi();
    });
    // sorting
    self.sortEntitiesBy = function (data, event) {
        var sortField = $(event.target).data("sortField");
        if (sortField == self.queryOptions.sortField() && self.queryOptions.sortOrder() === "ASC") {
            self.queryOptions.sortOrder("DESC");
        }
        else {
            self.queryOptions.sortOrder("ASC");
        }
        self.queryOptions.sortField(sortField);
        self.queryOptions.currentPage(1);
        Logger.send(LogLevel.Info, "PagingService.ts", "Sort (" + self.queryOptions.sortField() + ", " + self.queryOptions
            .sortOrder() + ") in list of " + listName + " - OK");
        self.sendRequestApi();
    };
    // set css styl for sort icon ASC DSC
    self.buildSortIcon = function (sortField) { return ko.pureComputed(function () {
        var sortIcon = "sort";
        if (self.queryOptions.sortField() === sortField) {
            sortIcon += "-by-alphabet";
            if (self.queryOptions.sortOrder() === "DESC") {
                sortIcon += "-alt";
            }
        }
        return "glyphicon glyphicon-" + sortIcon;
    }); };
    //**** Pagging ********
    //first show page buttons
    self.firstShowpageButtons = ko.pureComputed(function () {
        //set pagging from 1 to 7 
        if (!self.queryOptions.goNextPrev()) {
            for (var i = 1; i <= 7; i++) {
                $('#btn_pg_' + typeTable + i).find('a').html(i.toString());
                $('#btn_pg_' + typeTable + i).removeClass('active');
                //hide unnecessery page buttons
                $('#btn_pg_' + typeTable + i).show();
                if (i > self.queryOptions.totalPages()) {
                    $('#btn_pg_' + typeTable + i).hide();
                }
            }
            ;
            $('#btn_pg_' + typeTable + self.queryOptions.currentPage()).addClass('active');
        }
    });
    var setPageButtons = function () {
        if (self.queryOptions.currentPage() < $('#btn_pg_' + typeTable + '1').find('a').text() || self.queryOptions.currentPage() > $('#btn_pg_' + typeTable + '7').find('a').text()) {
            var j = self.queryOptions.currentPage() - 7;
            if (j < 0)
                j = 0;
            for (var i = 0; i < 7; i++) {
                j++;
                $('#btn_pg_' + typeTable + (i + 1).toString()).find('a').html(j.toString());
                if (j > self.queryOptions.totalPages())
                    $('#btn_pg_' + typeTable + (i + 1).toString()).hide();
                else
                    $('#btn_pg_' + typeTable + (i + 1)).show();
            }
        }
        for (var i = 1; i <= 7; i++) {
            if ($('#btn_pg_' + typeTable + i).find('a').text() == self.queryOptions.currentPage())
                $('#btn_pg_' + typeTable + i).addClass('active');
            else
                $('#btn_pg_' + typeTable + i).removeClass('active');
        }
    };
    //Previous page
    self.previousPage = function (data, event) {
        if (self.queryOptions.currentPage() > 1) {
            self.queryOptions.currentPage(self.queryOptions.currentPage() - 1);
            setPageButtons();
            Logger.send(LogLevel.Info, 'PagingService.ts', 'Previous page in list of ' + listName + ' - OK');
            self.sendRequestApi(true);
        }
    };
    //Next page
    self.nextPage = function (data, event) {
        if (self.queryOptions.currentPage() < self.queryOptions.totalPages()) {
            self.queryOptions.currentPage(self.queryOptions.currentPage() + 1);
            setPageButtons();
            Logger.send(LogLevel.Info, 'PagingService.ts', 'Next page in list of ' + listName + ' - OK');
            self.sendRequestApi(true);
        }
    };
    //First page
    self.firstPage = function (data, event) {
        if (self.queryOptions.currentPage() > 1) {
            self.queryOptions.currentPage(1);
            Logger.send(LogLevel.Info, 'PagingService.ts', 'First page in list of ' + listName + ' - OK');
            self.sendRequestApi();
        }
    };
    //Last page
    self.lastPage = function (data, event) {
        if (self.queryOptions.currentPage() <= self.queryOptions.totalPages()) {
            self.queryOptions.currentPage(self.queryOptions.totalPages());
            setPageButtons();
            Logger.send(LogLevel.Info, 'PagingService.ts', 'Last page in list of ' + listName + ' - OK');
            self.sendRequestApi(true);
        }
    };
    //selectedPage
    self.selectedPage = function (data, event) {
        var buttonPageId = event.currentTarget.textContent;
        //console.log('innerText = ' + buttonPageId);
        self.queryOptions.currentPage(buttonPageId);
        self.sendRequestApi(true);
    };
    //set class previous button
    self.buildPreviousClass = ko.pureComputed(function () {
        var className = 'previous';
        if (self.queryOptions.currentPage() == 1)
            className += ' disabled';
        return className;
    });
    //set class next button
    self.buildNextClass = ko.pureComputed(function () {
        var className = 'next';
        if (self.queryOptions.currentPage() == self.queryOptions.totalPages())
            className += ' disabled';
        return className;
    });
    //set class First button
    self.buildFirstClass = ko.pureComputed(function () {
        var className = 'previous';
        if (self.queryOptions.currentPage() <= 1)
            className += ' disabled';
        return className;
    });
    //set class Last button
    self.buildLastClass = ko.pureComputed(function () {
        var className = 'next';
        if (self.queryOptions.currentPage() >= self.queryOptions.totalPages())
            className += ' disabled';
        return className;
    });
    //set active on pagging button
    self.buildActiveClassToPageButtons = ko.pureComputed(function () {
        for (var i = 1; i <= 7; i++) {
            if ($('#btn_pg_' + typeTable + i).find('a').text() == self.queryOptions.currentPage()) {
                //reset class active for all pg Buttons
                for (var j = 1; j <= 7; j++) {
                    $('#btn_pg_' + typeTable + j).removeClass('active');
                }
                //set class active for actual btn
                $('#btn_pg_' + typeTable + i).addClass('active');
                break;
            }
        }
    });
    //*****Pagging ********
    // when was change in search box, send request on data - repleacement autocomplete
    $("#" + "search" + typeTable).on("input", function () {
        self.queryOptions.searchString($(this).val());
        Logger.send(LogLevel.Info, "PagingService.ts", "Search (" + self.queryOptions.searchString() + ") in list of " + listName + " - OK");
        //delay 2 second between datarequest
        setTimeout(self.sendRequestApi, 2000);
    });
    // create variable queryOptions and set items as observable
    self.queryOptions = {
        currentPage: ko.observable(),
        totalPages: ko.observable(),
        pageSize: ko.observable(),
        sortField: ko.observable(),
        sortOrder: ko.observable(),
        searchString: ko.observable(),
        clickedId: ko.observable(),
        clickedName: ko.observable(),
        longName: ko.observable(),
        hierarchicalNumber: ko.observable(),
        subCategoryName: ko.observable(),
        goNextPrev: ko.observable(),
        //new filtering
        vatSelectedId: ko.observable(),
        statusSelectedId: ko.observable(),
        vendorSelectedId: ko.observable(),
        segmentSelectedId: ko.observable(),
        groupSelectedIds: ko.observable(),
        assortmentHeader: ko.observableArray(),
        //assortmentBody: ko.observableArray(),
        actionData: ko.observable(),
        //change some filter item
        filterChanged: ko.observable(),
        //switch to another goods type
        goodsTypeId: ko.observable(),
        goodsTypeIdChanged: ko.observable()
    };
    // update queryOptions
    self.updateQueryOptions = function (queryOptions) {
        self.queryOptions.currentPage(queryOptions.currentPage);
        self.queryOptions.totalPages(queryOptions.totalPages);
        self.queryOptions.pageSize(queryOptions.pageSize);
        self.queryOptions.sortField(queryOptions.sortField);
        self.queryOptions.sortOrder(queryOptions.sortOrder);
        //self.queryOptions.searchString(queryOptions.searchString);
        self.queryOptions.clickedId(queryOptions.clickedId);
        self.queryOptions.clickedName(queryOptions.clickedName);
        self.queryOptions.longName(queryOptions.longName);
        self.queryOptions.hierarchicalNumber(queryOptions.hierarchicalNumber);
        self.queryOptions.subCategoryName(queryOptions.subCategoryName);
        self.queryOptions.goNextPrev(queryOptions.goNextPrev);
        //new filtering
        self.queryOptions.vatSelectedId(queryOptions.vatSelectedId);
        self.queryOptions.statusSelectedId(queryOptions.statusSelectedId);
        self.queryOptions.vendorSelectedId(queryOptions.vendorSelectedId);
        self.queryOptions.segmentSelectedId(queryOptions.segmentSelectedId);
        self.queryOptions.groupSelectedIds(queryOptions.groupSelectedIds);
        self.queryOptions.filterChanged(queryOptions.filterChanged);
        self.queryOptions.goodsTypeId(queryOptions.goodsTypeId);
        self.queryOptions.goodsTypeIdChanged(queryOptions.goodsTypeIdChanged);
        //assortment header
        self.queryOptions.assortmentHeader(queryOptions.assortmentHeader);
        //assortment body 
        //self.queryOptions.assortmentBody(queryOptions.assortmentBody);
        self.queryOptions.actionData(queryOptions.actionData);
        // do function after all updates ??? asi vymazat
        self.firstShowpageButtons();
    };
    // call firstTime after load JS
    self.updateQueryOptions(queryOptions);
    // fill object queryOptions
    var getqueryOpt = function () {
        var queryOpt = new AjaxCall.Data.QueryOptions();
        queryOpt.currentPage = self.queryOptions.currentPage();
        queryOpt.totalPages = self.queryOptions.totalPages();
        queryOpt.pageSize = self.queryOptions.pageSize();
        queryOpt.sortField = self.queryOptions.sortField();
        queryOpt.sortOrder = self.queryOptions.sortOrder();
        queryOpt.searchString = self.queryOptions.searchString();
        queryOpt.clickedId = self.queryOptions.clickedId();
        queryOpt.clickedName = self.queryOptions.clickedName();
        queryOpt.goNextPrev = self.queryOptions.goNextPrev();
        queryOpt.longName = self.queryOptions.longName();
        queryOpt.hierarchicalNumber = self.queryOptions.hierarchicalNumber();
        queryOpt.subCategoryName = self.queryOptions.subCategoryName();
        queryOpt.filterChanged = self.queryOptions.filterChanged();
        queryOpt.goodsTypeId = self.queryOptions.goodsTypeId();
        queryOpt.goodsTypeIdChanged = self.queryOptions.goodsTypeIdChanged();
        //updates specify for slave table with Assortment list
        if (typeTable == 'Slave') {
            //filtering
            queryOpt.vatSelectedId = self.queryOptions.vatSelectedId();
            queryOpt.statusSelectedId = self.queryOptions.statusSelectedId();
            queryOpt.vendorSelectedId = self.queryOptions.vendorSelectedId();
            queryOpt.segmentSelectedId = self.queryOptions.segmentSelectedId();
            queryOpt.groupSelectedIds = self.queryOptions.groupSelectedIds();
            //headerList
            queryOpt.assortmentHeader = self.queryOptions.assortmentHeader();
            queryOpt.assortmentBody = self.entities();
            queryOpt.actionData = self.queryOptions.actionData();
        }
        return queryOpt;
    };
};
//# sourceMappingURL=PagingSorting.js.map