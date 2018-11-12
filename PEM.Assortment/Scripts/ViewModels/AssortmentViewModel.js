/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/bootstrap/bootstrap.d.ts" />
/// <reference path="../typings/bootstrap-select/index.d.ts" />
function AssortmentViewModel(resultList) {
    var self = this;
    // for service All Items
    self.pagingService =
        new PagingSorting(resultList.results, resultList.queryOptions, "api/Items/paging", "Items", "");
    // for service All Assortment of selected Item
    self.pagingServiceSlave =
        new PagingSorting(resultList.assortmentViewModel.assortmentList, resultList.queryOptionsSlave, "api/Assortment/paging", "Assortment", "Slave");
    //*** Header Assortment Table Item - first fill ***//
    self.pagingServiceSlave.queryOptions.assortmentHeader(resultList.assortmentViewModel.assortmentHeader);
    //*** for item selector
    self.goodsTypeList = ko.observableArray(resultList.goodsType);
    //assortments were edited
    self.assortmentsWereEdited = ko.observable(false);
    //*** Clicking on Item row ***//
    var selectRow = function (item) {
        // remove class from all rows
        $("#bodyItemsDataTable tr").each(function () {
            if ($(this).hasClass("station-selected-row"))
                $(this).removeClass("station-selected-row");
        });
        // add class
        $(document).ready(function () {
            $("#row" + item).addClass("station-selected-row");
        });
    };
    self.hasWriteRight = ko.observable(false);
    //click on item in master table
    self.getItemForEdit = function (data) {
        //find right to show active elements
        var shop = resultList.applicationRigts.rightToWriteShop;
        var fuel = resultList.applicationRigts.rightToWriteFuel;
        var typeGoods = $("#goodsFilter").val();
        self.hasWriteRight(false);
        if (typeGoods == "0" && shop == true || typeGoods == "1" && fuel == true) {
            self.hasWriteRight(true);
        }
        //enable expand button for all screen
        if ($("#collapseButton").hasClass("disabled")) {
            $("#collapseButton").removeClass("disabled");
        }
        ;
        self.newAssortmentTestToEdit(null);
        if (self.assortmentsWereEdited() || AjaxCall.Data.wasEdit) {
            //$('#btn_Cancel').click();
            Modal.BackChange.BackChange(CancelChangeAsrt, "Asrt_title_modal_BackChangesAssortmentEdit", "Asrt_msg_modal_ReallyBackChangesAssortmentEdit", "btn_ChangePricesNo", "btn_ChangePricesYes");
            $("#modalBackChange").modal("show");
            function CancelChangeAsrt() {
                selectRow(data.item);
                self.pagingServiceSlave.queryOptions.clickedId(data.item);
                self.pagingServiceSlave.queryOptions.clickedName(data.title);
                self.pagingServiceSlave.queryOptions.longName(data.longName);
                self.pagingServiceSlave.queryOptions.hierarchicalNumber(data.hierarchicalNumber);
                self.pagingServiceSlave.queryOptions.subCategoryName(data.subcategoryName);
                self.pagingServiceSlave.SendData();
            }
        }
        else {
            selectRow(data.item);
            self.pagingServiceSlave.queryOptions.clickedId(data.item);
            self.pagingServiceSlave.queryOptions.clickedName(data.title);
            self.pagingServiceSlave.queryOptions.longName(data.longName);
            self.pagingServiceSlave.queryOptions.hierarchicalNumber(data.hierarchicalNumber);
            self.pagingServiceSlave.queryOptions.subCategoryName(data.subcategoryName);
            //unhide asrt table
            if ($('#activeElements').hasClass('asrt-hidden')) {
                $('#activeElements').removeClass('asrt-hidden');
            }
            if ($('#assortmentWindow').hasClass('asrt-hidden')) {
                $('#assortmentWindow').removeClass('asrt-hidden');
            }
            //self.resetFilter();
            self.pagingServiceSlave.SendData();
        }
    };
    // run only first time and select first row
    selectRow(self.pagingServiceSlave.queryOptions.clickedId());
    //*** Filtering Items ***
    //*** Item selector
    //first fill
    self.goodsTypeList = ko.observableArray(resultList.goodsType);
    self.pagingService.queryOptions.goodsTypeId(resultList.queryOptions.goodsTypeId);
    self.pagingServiceSlave.queryOptions.goodsTypeId(resultList.queryOptions.goodsTypeId);
    self.goodsFilterChange = function () {
        var editNewGoodsType = function () {
            var goodsType = $('#goodsFilter').val();
            self.pagingService.queryOptions.goodsTypeId(goodsType);
            self.pagingServiceSlave.queryOptions.goodsTypeId(goodsType);
            self.pagingService.queryOptions.goodsTypeIdChanged(true);
            self.pagingServiceSlave.queryOptions.goodsTypeIdChanged(true);
            //request to items data
            self.pagingService.SendData();
            //set clolapse button
            if (!$("#collapseButton").hasClass("disabled")) {
                $("#collapseButton").addClass("disabled");
            }
            //hide asrt table
            if (!$('#activeElements').hasClass('asrt-hidden')) {
                $('#activeElements').addClass('asrt-hidden');
            }
            if (!$('#assortmentWindow').hasClass('asrt-hidden')) {
                $('#assortmentWindow').addClass('asrt-hidden');
            }
        };
        //test when was edit detected
        self.newAssortmentTestToEdit(null);
        if (self.assortmentsWereEdited() || AjaxCall.Data.wasEdit) {
            Modal.BackChange.BackChange(goEditAsrt, "Asrt_title_modal_BackChangesAssortmentEdit", "Asrt_msg_modal_ReallyBackChangesAssortmentEdit", "btn_ChangePricesNo", "btn_ChangePricesYes", cancelEditAsrt);
            $("#modalBackChange").modal("show");
            function goEditAsrt() {
                editNewGoodsType();
                return;
            }
            ;
            function cancelEditAsrt() {
                $('#goodsFilter').val(self.pagingService.queryOptions.goodsTypeId());
                $('#goodsFilter').selectpicker("refresh");
                return;
            }
            ;
        }
        else {
            editNewGoodsType();
            return;
        }
    };
    //*** Filtering Assortment ***
    //*** Vendor
    self.vendorResult = ko.observable(); //result after select
    ajaxCallRestSrv.customDropDownAutocomplete("txb_vendor_search", "api/Assortment/autocomplete", callBackSelectAutocomplete, null, "itemIdForAutocomplete", self.pagingService.queryOptions.goodsTypeId);
    function callBackSelectAutocomplete(data) {
        self.vendorResult(data.item.allData.supplierId);
        $('#txb_vendor_search').attr('title', data.item.allData.supplierLongName);
        //call update filter items and cal api for return data after filtering
        self.updateFilter();
    }
    //if search box is empty, reset self.vendorResult and update filter
    $('#txb_vendor_search').blur(function () {
        if ($('#txb_vendor_search').val() == "" || $('#txb_vendor_search').val() == undefined) {
            $('#txb_vendor_search').attr('title', '');
            self.vendorResult("");
            self.updateFilter();
        }
    });
    //**** VAT Classes
    self.vatclassResult = ko.observable(); //result after select
    self.vatclasslist = ko.observableArray(resultList.vatClasses); //VAT list of dropdown in filter
    self.vatclasslistX = ko.observableArray((resultList.vatClasses).slice(1, (resultList.vatClasses).length)); //VAT list of dropdown in table wihtout All
    //changing vat filter
    $('#vatFilter').change(function () {
        var startFirstVAT = self.vatclassResult();
        var vat = $('#vatFilter').val();
        self.vatclassResult(vat);
        //call update filter items and cal api for return data after filtering
        if (startFirstVAT != undefined) {
            self.updateFilter();
        }
    });
    //*** Statuses
    self.statusResult = ko.observable(); //result after select
    self.statuses = ko.observableArray(resultList.statuses); //list of dropdown in filter
    self.statusesX = ko.observableArray((resultList.statuses).slice(1, (resultList.statuses).length)); //VAT list of dropdown in table wihtout All
    //changing status filter 
    $('#statusFilter').change(function () {
        var startFirstStatus = self.statusResult();
        var stat = $('#statusFilter').val();
        self.statusResult(stat);
        if (startFirstStatus != undefined) {
            //call update filter items and cal api for return data after filtering
            self.updateFilter();
        }
    });
    //*** Site Segments
    self.multiPicTittle = ko.observable(Lang.getLang("Asrt_SelectGroup"));
    self.siteSegmentResult = ko.observable(); //result after select
    self.siteSegments = ko.observableArray(resultList.siteSegments); //list of dropdown
    self.isSelectedSegmentation = ko.observable(false);
    self.siteGroups = ko.observableArray(new Array()); //list of dropdown start empty
    //changing Segment filter 
    $('#segmentFilter').change(function () {
        var startFirstSegment = self.siteSegmentResult();
        var segment = $('#segmentFilter').val();
        //if segmentation was selected, than the group column in the table will be visible
        self.isSelectedSegmentation(segment != 0);
        self.siteSegmentResult(segment);
        if (startFirstSegment != undefined) {
            //update siteGroup
            var actualSiteGroup;
            var actualSiteGroupList = new Array();
            for (var i = 0; i < resultList.siteGroups.length; i++) {
                actualSiteGroup = new AjaxCall.Data.GroupClass();
                var grup = resultList.siteGroups[i];
                if (grup.segmentId == segment) {
                    actualSiteGroup.siteGroupId = grup.siteGroupId;
                    actualSiteGroup.siteGroupName = grup.siteGroupName;
                    actualSiteGroupList.push(actualSiteGroup);
                }
            }
            //new list of siteGroups by siteSegment
            self.siteGroups(actualSiteGroupList);
            //Reset Group filter
            $(document).ready(function () {
                $('#groupFilter').multiselect({
                    includeSelectAllOption: true,
                    nonSelectedText: 'XVyberte skupinu',
                    selectedClass: 'asrt-multi-polozky',
                    buttonWidth: '130',
                });
                $('#groupFilter').multiselect('rebuild');
            });
            self.siteGroupResult("");
            //call update filter items and cal api for return data after filtering
            self.updateFilter();
        }
    });
    //*** Site Groups
    self.siteGroupResult = ko.observable(); //result after select
    self.selectedGroups = ko.observableArray();
    //changing Group filter 
    self.filterByGroup = function () {
        var startFirstGroup = self.siteGroupResult();
        var group = $('#groupFilter').val().toString();
        self.siteGroupResult(group);
        if (startFirstGroup != undefined) {
            //call update filter items and cal api for return data after filtering
            self.updateFilter();
        }
    };
    //change datetime in header - rebind data
    self.changeAssortmentDate = function (data) {
        var id = data.columnHeaderId;
        $("#dateFromHeader" + id).val($("#dateFromHeader" + id).val()).change();
    };
    //update header
    self.updateHeaderAssortment = function () {
        AjaxCall.Data.wasEdit = false;
        for (var i = 0; i < self.pagingServiceSlave.queryOptions.assortmentHeader().length; i++) {
            var column = self.pagingServiceSlave.queryOptions.assortmentHeader()[i].columnHeaderId;
            self.pagingServiceSlave.queryOptions.assortmentHeader()[i].statusId = $('#statusFromHeader' + column).val();
            self.pagingServiceSlave.queryOptions.assortmentHeader()[i].vatId = $('#vatFromHeader' + column).val();
            //if is some deleted mark global variable as true - was edit
            if (self.pagingServiceSlave.queryOptions.assortmentHeader()[i].operations == 2) {
                AjaxCall.Data.wasEdit = true;
            }
            ;
        }
    };
    //*** Update header items for range change **//
    //change values for selected range - send to controller
    self.updateRange = function (nameColumn, newValue) {
        //update entities to queryoption
        self.pagingServiceSlave.queryOptions.assortmentBody = self.pagingServiceSlave.entities();
        ajaxCallRestSrv.postWebApi(ko.toJSON(self.pagingServiceSlave.queryOptions), false, Global.Variable.urlPrefix + "api/Assortment/UpdateRangeColumn", "UpdateRangeColumnAssortment", successOk, null, null, true);
        function successOk(data) {
            // update mainList
            self.pagingServiceSlave.updateEntities(data.results);
            // update queryOptions
            self.pagingServiceSlave.updateQueryOptions(data.queryOptions);
            //Logger.send(LogLevel.Info, "AssortmentViewModel.ts", "Update range column " + nameColumn + " to new value ... " + newValue + " ... of assortment");
            self.pagingServiceSlave.refreshSlaveElements();
        }
    };
    //Statuses
    self.updateRangeStatuses = function (data) {
        var columnId = data.columnHeaderId;
        var newStatus = $("#statusFromHeader" + columnId).val();
        for (var i = 0; i < self.pagingServiceSlave.queryOptions.assortmentHeader().length; i++) {
            if (self.pagingServiceSlave.queryOptions.assortmentHeader()[i].columnHeaderId == columnId) {
                self.pagingServiceSlave.queryOptions.assortmentHeader()[i].statusGroupChange = true;
            }
        }
        self.updateHeaderAssortment();
        self.updateRange("Statuses", newStatus);
    };
    //Vats
    self.updateRangeVats = function (data) {
        var columnId = data.columnHeaderId;
        var newVat = $("#vatFromHeader" + columnId).val();
        for (var i = 0; i < self.pagingServiceSlave.queryOptions.assortmentHeader().length; i++) {
            if (self.pagingServiceSlave.queryOptions.assortmentHeader()[i].columnHeaderId == columnId) {
                self.pagingServiceSlave.queryOptions.assortmentHeader()[i].vatGroupChange = true;
            }
        }
        self.updateHeaderAssortment();
        self.updateRange("Vats", newVat);
    };
    //Suppliers
    self.updateRangeSuppliers = function (data) {
        var columnId = data.columnHeaderId;
        var newSupplier = $("#supplierFromHeader" + columnId).val();
        for (var i = 0; i < self.pagingServiceSlave.queryOptions.assortmentHeader().length; i++) {
            if (self.pagingServiceSlave.queryOptions.assortmentHeader()[i].columnHeaderId == columnId) {
                self.pagingServiceSlave.queryOptions.assortmentHeader()[i].supplierGroupChange = true;
            }
        }
        //self.updateHeaderAssortment();
        self.pagingServiceSlave.queryOptions.assortmentHeader(self.pagingServiceSlave.queryOptions.assortmentHeader());
        self.updateRange("Suppliers", newSupplier);
    };
    //temporary variables for supplier in modal window
    self.supplierId = ko.observable();
    self.supplierName = ko.observable();
    self.supplierLongName = ko.observable();
    self.supplierInputId = ko.observable();
    // get Vendor in modal windows for table assortment header and body
    self.getSupplier = function (id, data) {
        //initialize data
        $('#modal_supplierSearch').val("");
        self.supplierInputId(id);
        self.supplierId(data.supplierId);
        self.supplierName(data.supplierName);
        self.supplierLongName(data.supplierLongName);
        ajaxCallRestSrv.customDropDownAutocomplete("modal_supplierSearch", "api/Assortment/autocomplete", callBackSelectAutocomplete, null, "", self.pagingService.queryOptions.goodsTypeId);
        function callBackSelectAutocomplete(data) {
            self.supplierId(data.item.allData.supplierId);
            self.supplierName(data.item.allData.supplierName);
            self.supplierLongName(data.item.allData.supplierLongName);
        }
        $('#' + id).attr("data-target", "#modalSuppliers");
    };
    //from modal window
    self.saveSupplier = function (data) {
        $('.asrt-supplier-modal').removeAttr("data-target");
        //if is not selected supplier
        if ($('#modal_supplierSearch').val() == "" || $('#modal_supplierSearch').val() == undefined) {
            $('#' + self.supplierInputId()).val("");
            self.supplierId("");
            self.supplierName("");
            self.supplierLongName("");
        }
        //update header supplier
        if ((self.supplierInputId()).search("supplierFromHeader") != -1) {
            var columnId = (self.supplierInputId()).split('supplierFromHeader')[1];
            for (var i = 0; i < self.pagingServiceSlave.queryOptions.assortmentHeader().length; i++) {
                if (self.pagingServiceSlave.queryOptions.assortmentHeader()[i].columnHeaderId == columnId) {
                    self.pagingServiceSlave.queryOptions.assortmentHeader()[i].supplierId = self.supplierId();
                    self.pagingServiceSlave.queryOptions.assortmentHeader()[i].supplierName = self.supplierName();
                    self.pagingServiceSlave.queryOptions.assortmentHeader()[i].supplierLongName = self.supplierLongName();
                    if ((self.supplierName()).length > 8) {
                        $('#supplierFromHeader' + columnId).val((self.supplierName()).substr(0, 7));
                    }
                    else {
                        $('#supplierFromHeader' + columnId).val(self.supplierName());
                    }
                    $('#supplierFromHeader' + columnId).attr('title', self.supplierLongName());
                }
            }
        }
        //update body supplier
        if ((self.supplierInputId()).search("supx") != -1) {
            var statDid = (self.supplierInputId()).split('supx')[0];
            var columnId = (self.supplierInputId()).split('supx')[1];
            for (var i = 0; i < self.pagingServiceSlave.entities().length; i++) {
                if (self.pagingServiceSlave.entities()[i].stationDID == statDid) {
                    for (var j = 0; j < self.pagingServiceSlave.entities()[i].assortmentLists.length; j++) {
                        if (self.pagingServiceSlave.entities()[i].assortmentLists[j].columnBodyId == columnId) {
                            self.pagingServiceSlave.entities()[i].assortmentLists[j].supplierId = self.supplierId();
                            self.pagingServiceSlave.entities()[i].assortmentLists[j].supplierName = self.supplierName();
                            self.pagingServiceSlave.entities()[i].assortmentLists[j].supplierLongName = self.supplierLongName();
                            self.pagingServiceSlave.entities()[i].assortmentLists[j].supplierChanged = true;
                            $('#' + self.supplierInputId()).val(self.supplierName());
                            $('#' + self.supplierInputId()).attr('title', self.supplierLongName());
                        }
                    }
                }
            }
        }
        self.supplierId("");
        self.supplierName("");
        self.supplierLongName("");
        self.supplierInputId("");
    };
    //from modal window
    self.cancelSupplier = function (data) {
        $('.asrt-supplier-modal').removeAttr("data-target");
        self.supplierId("");
        self.supplierName("");
        self.supplierLongName("");
        self.supplierInputId("");
    };
    self.newAssortmentTestToEdit = function (columnId) {
        self.assortmentsWereEdited(false);
        self.updateHeaderAssortment();
        self.pagingServiceSlave.queryOptions.assortmentBody = self.pagingServiceSlave.entities();
        ajaxCallRestSrv.postWebApi(ko.toJSON(self.pagingServiceSlave.queryOptions), false, Global.Variable.urlPrefix + "api/Items/NewAssortmentWereEdited?columnId=" + columnId, "canBeNewAssortmentDeleted", successOk, null, fail, false);
        function successOk(json) {
            //Logger.send(LogLevel.Info, "AssortmentViewModel.ts", "Getting bool (true), when were new assortments edited");
            self.assortmentsWereEdited(json);
            self.pagingServiceSlave.refreshSlaveElements();
        }
        function fail(jqXHR, textStatus) {
            AjaxFail.getFailBox("NewAssortmentWereEdited", "errorRequestData", true);
        }
    };
    //delete-undelete Column Assortment
    self.deleteColumnAssortment = function (data) {
        var columnId = data.columnHeaderId;
        var trashId = 'delete' + columnId;
        var newColumn = data.newAssortmentColumn;
        var doneToUndo = false;
        //mark as delete
        //if ($('#' + trashId).hasClass('glyphicon-trash')) {
        if (data.operations == AjaxCall.Data.operation.Nothing && !newColumn) {
            //set data
            for (var i = 0; i < self.pagingServiceSlave.queryOptions.assortmentHeader().length; i++) {
                if (self.pagingServiceSlave.queryOptions.assortmentHeader()[i].columnHeaderId == columnId) {
                    self.pagingServiceSlave.queryOptions.assortmentHeader()[i].operations = AjaxCall.Data.operation.Delete;
                }
            }
            doneToUndo = true;
            //set styles for 
            //date picker
            if (!$('#dateFromHeader' + columnId).hasClass('asrt-dateTime-Strike-Red')) {
                $('#dateFromHeader' + columnId).addClass('asrt-dateTime-Strike-Red');
            }
            $('#dateFromHeader' + columnId).prop("disabled", true);
            if (!$('#dateFromHeaderIcon' + columnId).hasClass('asrt-dateTime-Strike-Red')) {
                $('#dateFromHeaderIcon' + columnId).addClass('asrt-dateTime-Strike-Red');
            }
            //trash
            $('#' + trashId).removeClass('glyphicon-trash').addClass('glyphicon-repeat');
            //Status
            if (!$('div.status' + columnId + ' > button').hasClass('asrt-selectPic-Strike-Red')) {
                $('div.status' + columnId + ' > button').addClass('asrt-selectPic-Strike-Red');
            }
            $('div.status' + columnId + ' > button').prop("disabled", true);
            //Vat
            if (!$('div.vat' + columnId + ' > button').hasClass('asrt-selectPic-Strike-Red')) {
                $('div.vat' + columnId + ' > button').addClass('asrt-selectPic-Strike-Red');
            }
            $('div.vat' + columnId + ' > button').prop("disabled", true);
            //supplier
            if (!$('.supplier' + columnId).hasClass('asrt-Cell-Strike-Red')) {
                $('.supplier' + columnId).addClass('asrt-Cell-Strike-Red');
            }
            $('.supplier' + columnId).prop("disabled", true);
        }
        //mark as undeleted
        //if ($('#' + trashId).hasClass('glyphicon-repeat') && !doneToUndo) {
        if (data.operations == AjaxCall.Data.operation.Delete && !doneToUndo && !newColumn) {
            //set data
            for (var i = 0; i < self.pagingServiceSlave.queryOptions.assortmentHeader().length; i++) {
                if (self.pagingServiceSlave.queryOptions.assortmentHeader()[i].columnHeaderId == columnId) {
                    self.pagingServiceSlave.queryOptions.assortmentHeader()[i].operations = AjaxCall.Data.operation.Nothing;
                }
            }
            //set styles
            //date picker
            if ($('#dateFromHeader' + columnId).hasClass('asrt-dateTime-Strike-Red')) {
                $('#dateFromHeader' + columnId).removeClass('asrt-dateTime-Strike-Red');
            }
            $('#dateFromHeader' + columnId).prop("disabled", false);
            if ($('#dateFromHeaderIcon' + columnId).hasClass('asrt-dateTime-Strike-Red')) {
                $('#dateFromHeaderIcon' + columnId).removeClass('asrt-dateTime-Strike-Red');
            }
            //trash
            $('#' + trashId).removeClass('glyphicon-repeat').addClass('glyphicon-trash');
            //Status
            if ($('div.status' + columnId + ' > button').hasClass('asrt-selectPic-Strike-Red')) {
                $('div.status' + columnId + ' > button').removeClass('asrt-selectPic-Strike-Red');
            }
            $('div.status' + columnId + ' > button').prop("disabled", false);
            //Vat
            if ($('div.vat' + columnId + ' > button').hasClass('asrt-selectPic-Strike-Red')) {
                $('div.vat' + columnId + ' > button').removeClass('asrt-selectPic-Strike-Red');
            }
            $('div.vat' + columnId + ' > button').prop("disabled", false);
            //supplier
            if ($('.supplier' + columnId).hasClass('asrt-Cell-Strike-Red')) {
                $('.supplier' + columnId).removeClass('asrt-Cell-Strike-Red');
            }
            $('.supplier' + columnId).prop("disabled", false);
        }
        self.updateHeaderAssortment();
        //try delete aded new column
        if (newColumn) {
            //can be deleted?
            self.newAssortmentTestToEdit(columnId);
            if (self.assortmentsWereEdited()) {
                Modal.BackChange.BackChange(deletePricelist, "Asrt_title_deleteNewAsrt", "Asrt_msg_ReallyDeleteNewAsrt", "Asrt_btn_DeleteNewAsrtNo", "Asrt_btn_DeleteNewAsrtYes");
                $('#modalBackChange').modal("show");
            }
            else {
                deletePricelist();
            }
            function deletePricelist() {
                //update entities to queryoption
                self.pagingServiceSlave.queryOptions.assortmentBody = self.pagingServiceSlave.entities();
                ajaxCallRestSrv.postWebApi(ko.toJSON(self.pagingServiceSlave.queryOptions), false, Global.Variable.urlPrefix + "api/Assortment/DeleteAssortment?columnHeaderId=" + columnId, "DeleteNewAssortment", successOk, null, fail, true);
                function successOk(data) {
                    // update mainList
                    self.pagingServiceSlave.updateEntities(data.results);
                    // update queryOptions
                    self.pagingServiceSlave.updateQueryOptions(data.queryOptions);
                    //Logger.send(LogLevel.Info, "AssortmentViewModel.ts", " Try to remove new added column of assortment");
                    self.pagingServiceSlave.refreshSlaveElements();
                }
                function fail(jqXHR, textStatus) {
                    AjaxFail.getFailBox("deleteNewAddedAssortments", "errorRequestData", true);
                }
            }
        }
    };
    //*** Buttons
    // button add new assortment
    self.addNewAssortment = function () {
        if (!$("#btn_AddAssortment").hasClass("disabled")) {
            $("#btn_AddAssortment").addClass("disabled");
            //update entities to queryoption
            self.updateHeaderAssortment();
            self.pagingServiceSlave.queryOptions.assortmentBody = self.pagingServiceSlave.entities();
            ajaxCallRestSrv.postWebApi(ko.toJSON(self.pagingServiceSlave.queryOptions), false, Global.Variable.urlPrefix + "api/Assortment/AddNewAssortment", "AddNewAssortment", successOk, null, null, true);
            function successOk(data) {
                // update mainList
                self.pagingServiceSlave.updateEntities(data.results);
                // update queryOptions
                self.pagingServiceSlave.updateQueryOptions(data.queryOptions);
                //Logger.send(LogLevel.Info, "AssortmentViewModel.ts", " Adding new assortment column was successful");
                self.pagingServiceSlave.refreshSlaveElements();
                if ($("#btn_AddAssortment").hasClass("disabled")) {
                    $("#btn_AddAssortment").removeClass("disabled");
                }
            }
        }
    };
    // button save assortment
    self.saveAssortment = function () {
        //save assortment
        var saveAssortmentData = function () {
            //update entities to queryoption
            self.updateHeaderAssortment();
            self.pagingServiceSlave.queryOptions.assortmentBody = self.pagingServiceSlave.entities();
            ajaxCallRestSrv.postWebApi(ko.toJSON(self.pagingServiceSlave.queryOptions), false, Global.Variable.urlPrefix + "api/Assortment/SaveAssortment", "SaveAssortment", successOk, null, fail, true);
            function successOk(data) {
                // update mainList
                self.pagingServiceSlave.updateEntities(data.results);
                // update queryOptions
                self.pagingServiceSlave.updateQueryOptions(data.queryOptions);
                //Logger.send(LogLevel.Info, "AssortmentViewModel.ts", "Save Assortment success");
                self.pagingServiceSlave.refreshSlaveElements();
            }
            function fail(jqXHR, textStatus) {
                if (jqXHR.status == 406) {
                    Modal.Warning.Button_Ok("Asrt_Warning", jqXHR.responseJSON);
                    $('#warningModal').modal("show");
                }
                else {
                    AjaxFail.getFailBox("SaveAllChangesIntoDb", "errorRequestData", true);
                }
            }
        };
        // remove attr modal window
        $("#btn_Save").removeAttr("data-target");
        //was edit activity
        self.newAssortmentTestToEdit(null);
        if (self.assortmentsWereEdited() || AjaxCall.Data.wasEdit) {
            $("#btn_Save").attr("data-target", "#modalApplySave");
            Modal.AplySave.Button_ApplySaveCompPrices(saveAssortmentData, "Asrt_title_modal_ReallySaveAssortment", "Asrt_msg_modal_ReallySaveAssortment");
        }
        //was not edit activity
        if (!self.assortmentsWereEdited() && !AjaxCall.Data.wasEdit) {
            $("#btn_Save").attr("data-target", "#modalEditActivity");
            Modal.EditActivity.buttonOk("Asrt_hdr_Notice", "Asrt_msg_AssortmentNotEdited");
        }
    };
    // cancel assortment
    self.cancelAssortment = function (data) {
        //was not edit activity
        self.newAssortmentTestToEdit(null);
        if (!self.assortmentsWereEdited() && !AjaxCall.Data.wasEdit) {
            $("#btn_Cancel").attr("data-target", "#modalEditActivity");
            Modal.EditActivity.buttonOk("Asrt_hdr_Notice", "Asrt_msg_AssortmentNotEdited");
        }
        if (self.assortmentsWereEdited() || AjaxCall.Data.wasEdit) {
            $("#btn_Cancel").attr("data-target", "#modalBackChange");
            Modal.BackChange.BackChange(CancelChangeAssortment, "Asrt_title_modal_BackChangesAssortmentEdit", "Asrt_msg_modal_ReallyBackChangesAssortmentEdit", "btn_ChangePricesNo", "btn_ChangePricesYes");
            function CancelChangeAssortment() {
                //update entities to queryoption
                self.updateHeaderAssortment();
                self.pagingServiceSlave.queryOptions.assortmentBody = self.pagingServiceSlave.entities();
                ajaxCallRestSrv.postWebApi(ko.toJSON(self.pagingServiceSlave.queryOptions), false, Global.Variable.urlPrefix + "api/Assortment/CancelAssortment", "CancelAssortment", successOk, null, null, true);
                function successOk(data) {
                    // update mainList
                    self.pagingServiceSlave.updateEntities(data.results);
                    // update queryOptions
                    self.pagingServiceSlave.updateQueryOptions(data.queryOptions);
                    //Logger.send(LogLevel.Info, "AssortmentViewModel.ts", "Cancel editing of Assortment success");
                    self.pagingServiceSlave.refreshSlaveElements();
                }
            }
        }
    };
    //*** Update filter and call api for return data after filtering
    self.updateFilter = function () {
        //update Fields for range
        self.pagingServiceSlave.queryOptions.vatSelectedId(self.vatclassResult());
        self.pagingServiceSlave.queryOptions.statusSelectedId(self.statusResult());
        self.pagingServiceSlave.queryOptions.vendorSelectedId(self.vendorResult());
        self.pagingServiceSlave.queryOptions.segmentSelectedId(self.siteSegmentResult());
        self.pagingServiceSlave.queryOptions.groupSelectedIds(self.siteGroupResult());
        self.pagingServiceSlave.queryOptions.filterChanged(true);
        //request to data
        self.pagingServiceSlave.SendData();
    };
    //reset filter
    self.resetFilter = function () {
        // reset autocomplete
        $('#txb_vendor_search').val('');
        self.vendorResult("");
        //reset VAT filter
        $('#vatFilter').val('default');
        $('#vatFilter').selectpicker("refresh");
        self.vatclassResult("");
        //Reset Status filter
        $('#statusFilter').val('default');
        $('#statusFilter').selectpicker("refresh");
        self.statusResult("");
        //reset Segment filter
        $('#segmentFilter').val('default');
        $('#segmentFilter').selectpicker("refresh");
        self.siteSegmentResult("");
        //Reset Group filter
        self.siteGroups(new Array());
        //$('#groupFilter').val('default');
        $('#groupFilter').multiselect('rebuild');
        self.siteGroupResult("");
        //call update filter items and cal api for return data after filtering
        self.updateFilter();
    };
    /*** Hide/UnHide Items Table ***/
    self.collapseAssortItems = function () {
        if (!$("#collapseButton").hasClass("disabled")) {
            $("#itemsTable").hide();
            $("#tittleDiv").hide();
            $("#showButton").show();
            if ($("#activeElements").hasClass("col-sm-8 col-md-8 col-lg-9")) {
                $("#activeElements").removeClass("col-sm-8 col-md-8 col-lg-9").addClass("col-sm-12 col-md-12 col-lg-12");
            }
            if ($("#assortmentWindow").hasClass("col-sm-8 col-md-8 col-lg-9")) {
                $("#assortmentWindow").removeClass("col-sm-8 col-md-8 col-lg-9").addClass("col-sm-12 col-md-12 col-lg-12");
            }
        }
    };
    self.showAssortItems = function () {
        $("#itemsTable").show();
        $("#tittleDiv").show();
        $("#showButton").hide();
        if ($("#activeElements").hasClass("col-sm-12 col-md-12 col-lg-12")) {
            $("#activeElements").removeClass("col-sm-12 col-md-12 col-lg-12").addClass("col-sm-8 col-md-8 col-lg-9");
        }
        if ($("#assortmentWindow").hasClass("col-sm-12 col-md-12 col-lg-12")) {
            $("#assortmentWindow").removeClass("col-sm-12 col-md-12 col-lg-12").addClass("col-sm-8 col-md-8 col-lg-9");
        }
    };
}
var AjaxCall;
(function (AjaxCall) {
    var Data;
    (function (Data) {
        Data.wasEdit = false;
        var GroupClass = /** @class */ (function () {
            function GroupClass() {
            }
            return GroupClass;
        }());
        Data.GroupClass = GroupClass;
        var operation;
        (function (operation) {
            operation[operation["Nothing"] = 0] = "Nothing";
            operation[operation["Create"] = 1] = "Create";
            operation[operation["Delete"] = 2] = "Delete";
            operation[operation["Update"] = 3] = "Update";
        })(operation = Data.operation || (Data.operation = {}));
    })(Data = AjaxCall.Data || (AjaxCall.Data = {}));
})(AjaxCall || (AjaxCall = {}));
// ################ Modal Windows ############################
// save
var Modal;
(function (Modal) {
    var AplySave;
    (function (AplySave) {
        AplySave.paramApplySave = new Modal.CreateWindow.ParametersModal();
        AplySave.paramApplySave.DivIdForModal = "modalApplySave";
        AplySave.paramApplySave.TitleTextId = "title_modal_applySaveComp";
        AplySave.paramApplySave.BodyTextId = "body_modal_ApplySave";
        AplySave.paramApplySave.BtnOKText = Lang.getLang("asrt_btn_Save");
        AplySave.paramApplySave.BtnCancelText = Lang.getLang("asrt_btn_Cancel");
        AplySave.paramApplySave.BtnOKId = "btn_SaveAplyOKId";
        AplySave.paramApplySave.BtnCancelId = "btn_SaveAplyCancelId";
        AplySave.paramApplySave.TitleBgColorClass = "modal-green-header";
        AplySave.paramApplySave.BtnCancelBgColorClass = "btn-default";
        AplySave.paramApplySave.BtnOKBgColorClass = "btn-success";
        AplySave.Button_ApplySaveCompPrices = function (ulozTo, keyTitleModal, keyBodyModal) {
            $("#" + AplySave.paramApplySave.TitleTextId).html(Lang.getLang(keyTitleModal));
            $("#" + AplySave.paramApplySave.BodyTextId).html(Lang.getLang(keyBodyModal));
            $("#" + AplySave.paramApplySave.BtnOKId).unbind("click");
            $("#" + AplySave.paramApplySave.BtnCancelId).focus();
            $("#" + AplySave.paramApplySave.BtnOKId).click(function () {
                ulozTo();
            });
        };
    })(AplySave = Modal.AplySave || (Modal.AplySave = {}));
})(Modal || (Modal = {}));
// backChange
(function (Modal) {
    var BackChange;
    (function (BackChange_1) {
        BackChange_1.paramBackChange = new Modal.CreateWindow.ParametersModal();
        BackChange_1.paramBackChange.DivIdForModal = "modalBackChange";
        BackChange_1.paramBackChange.TitleTextId = "title_modal_BackChangeId";
        //paramBackChange.BodyText = Lang.getLang('msg_modal_ReallyBackChangesUsersComp');
        BackChange_1.paramBackChange.BodyTextId = "body_modal_BackChangeId";
        BackChange_1.paramBackChange.BtnOKText = Lang.getLang("btn_ChangePricesYes");
        BackChange_1.paramBackChange.BtnCancelText = Lang.getLang("btn_ChangePricesNo");
        BackChange_1.paramBackChange.BtnOKId = "btn_ChangeOKId";
        BackChange_1.paramBackChange.BtnCancelId = "btn_ChangeNoId";
        BackChange_1.paramBackChange.TitleBgColorClass = "modal-red-header";
        BackChange_1.paramBackChange.BtnCancelBgColorClass = "btn-default";
        BackChange_1.paramBackChange.BtnOKBgColorClass = "btn-danger";
        BackChange_1.BackChange = function (OKFunction, titleTextKeyBack, bodyTextKeyBack, buttonCancelText, buttonOkText, CancelFunction) {
            if (CancelFunction === void 0) { CancelFunction = null; }
            $("#" + BackChange_1.paramBackChange.TitleTextId).html(Lang.getLang(titleTextKeyBack));
            $("#" + BackChange_1.paramBackChange.BodyTextId).html(Lang.getLang(bodyTextKeyBack));
            $("#" + BackChange_1.paramBackChange.BtnOKId).html(Lang.getLang(buttonOkText));
            $("#" + BackChange_1.paramBackChange.BtnCancelId).html(Lang.getLang(buttonCancelText));
            //Cancel Button
            $("#" + BackChange_1.paramBackChange.BtnCancelId).focus();
            $("#" + BackChange_1.paramBackChange.BtnCancelId).unbind("click");
            $("#" + BackChange_1.paramBackChange.BtnCancelId).click(function () {
                if (CancelFunction != null) {
                    CancelFunction();
                }
            });
            // OK Button
            $("#" + BackChange_1.paramBackChange.BtnOKId).unbind("click");
            $("#" + BackChange_1.paramBackChange.BtnOKId).click(function () {
                OKFunction();
            });
        };
    })(BackChange = Modal.BackChange || (Modal.BackChange = {}));
})(Modal || (Modal = {}));
// #modalEditActivity
(function (Modal) {
    var EditActivity;
    (function (EditActivity) {
        EditActivity.paramEditActivity = new Modal.CreateWindow.ParametersModal();
        EditActivity.paramEditActivity.DivIdForModal = "modalEditActivity";
        EditActivity.paramEditActivity.TitleTextId = "title_modal_EditActivityId";
        EditActivity.paramEditActivity.BodyTextId = "body_modal_EditActivityId";
        EditActivity.paramEditActivity.BtnOKText = "OK";
        EditActivity.paramEditActivity.BtnCancelText = "";
        EditActivity.paramEditActivity.BtnOKId = "btn_ChangeOKId";
        EditActivity.paramEditActivity.BtnCancelId = "";
        EditActivity.paramEditActivity.TitleBgColorClass = "modal-blue-header";
        EditActivity.paramEditActivity.BtnCancelBgColorClass = "btn-default";
        EditActivity.paramEditActivity.BtnOKBgColorClass = "btn-primary";
        EditActivity.buttonOk = function (titleTextKey, bodyTextKey) {
            $("#title_modal_EditActivityId").closest("div.modal-warning-header").removeClass("modal-warning-header")
                .addClass("modal-blue-header");
            $("#" + EditActivity.paramEditActivity.TitleTextId).html(Lang.getLang(titleTextKey));
            $("#" + EditActivity.paramEditActivity.BodyTextId).html(Lang.getLang(bodyTextKey));
        };
        /*
        export var Button_OK2 = function (titleTextKey: string, bodyTextKey: string, headerColor: string) {
            $("#" + paramEditActivity.TitleTextId).html(titleTextKey);
            $("#" + paramEditActivity.BodyTextId).html(Lang.getLang(bodyTextKey));
        };*/
    })(EditActivity = Modal.EditActivity || (Modal.EditActivity = {}));
})(Modal || (Modal = {}));
// info modal
(function (Modal) {
    var Warning;
    (function (Warning) {
        Warning.paramWarning = new Modal.CreateWindow.ParametersModal();
        Warning.paramWarning.DivIdForModal = "warningModal";
        Warning.paramWarning.TitleTextId = "title_modal_infoEditActivityId";
        Warning.paramWarning.BodyTextId = "body_modal_infoEditActivityId";
        Warning.paramWarning.BtnOKText = "OK";
        Warning.paramWarning.BtnCancelText = "";
        Warning.paramWarning.BtnOKId = "btn_ChangeOKId";
        Warning.paramWarning.BtnCancelId = "";
        Warning.paramWarning.TitleBgColorClass = "modal-red-header";
        Warning.paramWarning.BtnCancelBgColorClass = "btn-danger";
        Warning.paramWarning.BtnOKBgColorClass = "btn-danger";
        Warning.Button_Ok = function (titleTextKey, bodyTextKey) {
            $("#" + Warning.paramWarning.TitleTextId).html(Lang.getLang(titleTextKey));
            $("#" + Warning.paramWarning.BodyTextId).html(bodyTextKey);
        };
    })(Warning = Modal.Warning || (Modal.Warning = {}));
})(Modal || (Modal = {}));
;
// generate Modal Y/N ApplySave
modalWinYesNo.createModal(Modal.AplySave.paramApplySave);
// generate Modal Y/N BackChange
modalWinYesNo.createModal(Modal.BackChange.paramBackChange);
// generate Modal Y EditActivity
modalWinYesNo.createModal(Modal.EditActivity.paramEditActivity);
// generate Modal Y Warning
modalWinYesNo.createModal(Modal.Warning.paramWarning);
//# sourceMappingURL=AssortmentViewModel.js.map