/// <reference path="../typings/bootstrap/bootstrap.d.ts" />
// this script must be on first call from user scripts
var Global;
(function (Global) {
    var Variable;
    (function (Variable) {
    })(Variable = Global.Variable || (Global.Variable = {}));
})(Global || (Global = {}));
// log action in JS
var AjaxCall;
(function (AjaxCall) {
    var StatusLog;
    (function (StatusLog) {
        var StatusLogAjax = /** @class */ (function () {
            function StatusLogAjax() {
                this.type = "POST";
                this.cache = false;
                this.contentType = "application/json; charset=utf-8";
                this.data = null;
            }
            StatusLogAjax.prototype.send = function (logLevel, scriptName, actionName) {
                function getData() {
                    var statusLogViewModel = new StatusLogViewModel();
                    statusLogViewModel.setProperty(logLevel, scriptName, actionName);
                    var postData = null;
                    postData = (JSON.stringify(statusLogViewModel));
                    return postData;
                }
                this.url = Global.Variable.urlPrefix + "api/StatusLog";
                $.ajax({
                    url: this.url,
                    type: this.type,
                    cache: this.cache,
                    contentType: this.contentType,
                    data: getData()
                }).done(function (data) {
                    // ok ... 
                }).fail(function () {
                    // todo co v pripade neuspechu, asi nic ???
                });
            };
            ;
            return StatusLogAjax;
        }());
        StatusLog.StatusLogAjax = StatusLogAjax;
        ;
        ;
        var StatusLogViewModel = /** @class */ (function () {
            function StatusLogViewModel() {
            }
            StatusLogViewModel.prototype.setProperty = function (LogLevel, ScriptName, ActionName) {
                this.logLevel = LogLevel;
                this.scriptName = ScriptName;
                this.actionName = ActionName;
            };
            ;
            return StatusLogViewModel;
        }());
        ;
    })(StatusLog = AjaxCall.StatusLog || (AjaxCall.StatusLog = {}));
})(AjaxCall || (AjaxCall = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["None"] = 0] = "None";
    LogLevel[LogLevel["System"] = 1] = "System";
    LogLevel[LogLevel["Error"] = 2] = "Error";
    LogLevel[LogLevel["Control"] = 3] = "Control";
    LogLevel[LogLevel["Info"] = 4] = "Info";
})(LogLevel || (LogLevel = {}));
// localize txt on screen
(function (AjaxCall) {
    var Langs;
    (function (Langs) {
        var Lang = /** @class */ (function () {
            function Lang(key) {
                this.key = "";
                this.key = key;
            }
            return Lang;
        }());
        var LocalizationAjax = /** @class */ (function () {
            function LocalizationAjax() {
                this.type = "POST";
                this.cache = false;
                this.async = false;
                this.contentType = "application/json; charset=utf-8";
                this.data = null;
            }
            LocalizationAjax.prototype.getLang = function (key) {
                this.url = Global.Variable.urlPrefix + "api/Langs";
                var lanString = "Untranslated";
                var getTranslate = function (valueString) {
                    lanString = valueString;
                };
                $.ajax({
                    url: this.url,
                    type: this.type,
                    cache: this.cache,
                    async: this.async,
                    contentType: this.contentType,
                    data: JSON.stringify(new Lang(key))
                }).done(function (data) {
                    if (data != undefined) {
                        getTranslate(data);
                    }
                    else {
                        getTranslate("Untranslated");
                    }
                }).fail(function () {
                    getTranslate("Untranslated");
                });
                return lanString;
            };
            ;
            return LocalizationAjax;
        }());
        Langs.LocalizationAjax = LocalizationAjax;
    })(Langs = AjaxCall.Langs || (AjaxCall.Langs = {}));
})(AjaxCall || (AjaxCall = {}));
// get membership roles
(function (AjaxCall) {
    var Roles;
    (function (Roles) {
        var RoleApi = /** @class */ (function () {
            function RoleApi() {
                this.AdminRole = false;
                this.ResetComRole = false;
                this.DeleteComRole = false;
                this.ViewerComRole = false;
            }
            return RoleApi;
        }());
        Roles.RoleApi = RoleApi;
        var UserRoles = /** @class */ (function () {
            function UserRoles() {
                this.type = "POST";
                this.cache = false;
                this.async = false;
                this.contentType = "application/json; charset=utf-8";
                this.data = null;
            }
            UserRoles.prototype.getRoles = function () {
                this.url = Global.Variable.urlPrefix + "api/UserRole";
                var roleApi;
                var fillRoles = function (role) {
                    roleApi = new RoleApi();
                    roleApi.AdminRole = role.AdminRole;
                    roleApi.DeleteComRole = role.DeleteComRole;
                    roleApi.ResetComRole = role.ResetComRole;
                    roleApi.ViewerComRole = role.ViewerComRole;
                };
                $.ajax({
                    url: this.url,
                    type: this.type,
                    cache: this.cache,
                    async: this.async,
                    contentType: this.contentType
                }).done(function (data) {
                    if (data != undefined) {
                        fillRoles(data);
                    }
                }).fail(function () {
                });
                return roleApi;
            };
            return UserRoles;
        }());
        Roles.UserRoles = UserRoles;
    })(Roles = AjaxCall.Roles || (AjaxCall.Roles = {}));
})(AjaxCall || (AjaxCall = {}));
// show and log errors
(function (AjaxCall) {
    var Error;
    (function (Error) {
        var ErrorBox = /** @class */ (function () {
            function ErrorBox() {
            }
            ErrorBox.prototype.getFailBox = function (tableName, errorMessageKeyLang, sendToLog) {
                if (sendToLog === void 0) { sendToLog = true; }
                $(".body-content").prepend('<div id="alertMessage" style="margin-top:20px; margin-bottom:20px;"><div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>' +
                    Lang.getLang("Error") +
                    "&nbsp</strong>" +
                    Lang.getLang(errorMessageKeyLang) +
                    "</div></div>");
                if (sendToLog) {
                    Logger.send(LogLevel.Error, "Helpers.ts", "Error loading list of " + tableName + " - Error");
                }
            };
            ErrorBox.prototype.getFailBoxWithParameter = function (tableName, errorMessageKeyLang, parameter, sendToLog) {
                if (sendToLog === void 0) { sendToLog = true; }
                $(".body-content").prepend('<div id="alertMessage" style="margin-top:20px; margin-bottom:20px;"><div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>' +
                    Lang.getLang("Error") +
                    "&nbsp</strong>" +
                    Lang.getLang(errorMessageKeyLang) + parameter +
                    "</div></div>");
                if (sendToLog) {
                    Logger.send(LogLevel.Error, "Helpers.ts", "Error loading list of " + tableName + " - Error");
                }
            };
            return ErrorBox;
        }());
        Error.ErrorBox = ErrorBox;
    })(Error = AjaxCall.Error || (AjaxCall.Error = {}));
})(AjaxCall || (AjaxCall = {}));
// show success
(function (AjaxCall) {
    var Success;
    (function (Success) {
        var SuccessBox = /** @class */ (function () {
            function SuccessBox() {
            }
            SuccessBox.prototype.getSuccessBox = function (tableName, errorMessageKeyLang, sendToLog) {
                if (sendToLog === void 0) { sendToLog = true; }
                toastr.options = {
                    "closeButton": true,
                    "debug": false,
                    "newestOnTop": false,
                    "progressBar": false,
                    "positionClass": "toast-top-right",
                    "preventDuplicates": false,
                    "onclick": null,
                    "showDuration": 300,
                    "hideDuration": 1000,
                    "timeOut": 5000,
                    "extendedTimeOut": 1000,
                    "showEasing": "swing",
                    "hideEasing": "linear",
                    "showMethod": "fadeIn",
                    "hideMethod": "fadeOut"
                };
                toastr["success"]("Data boli uspesne nacitane.", "Succses");
            };
            return SuccessBox;
        }());
        Success.SuccessBox = SuccessBox;
    })(Success = AjaxCall.Success || (AjaxCall.Success = {}));
})(AjaxCall || (AjaxCall = {}));
// show and log message in red window
(function (AjaxCall) {
    var Message;
    (function (Message) {
        var MessageBox = /** @class */ (function () {
            function MessageBox() {
            }
            MessageBox.prototype.getFailBox = function (title, errorMessageKeyLang, sendToLog) {
                if (sendToLog === void 0) { sendToLog = true; }
                $(".body-content").prepend('<div style="margin-top:20px; margin-bottom:20px;"><div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>' +
                    Lang.getLang("Error") +
                    "&nbsp</strong>" +
                    Lang.getLang(errorMessageKeyLang) +
                    "</div></div>");
                if (sendToLog) {
                    Logger.send(LogLevel.Info, "Helpers.ts", "Error Message from " + title + " - " + Lang.getLang(errorMessageKeyLang));
                }
            };
            return MessageBox;
        }());
        Message.MessageBox = MessageBox;
    })(Message = AjaxCall.Message || (AjaxCall.Message = {}));
})(AjaxCall || (AjaxCall = {}));
// data neccessery for Ajax REST
(function (AjaxCall) {
    var Data;
    (function (Data) {
        var QueryOptions = /** @class */ (function () {
            function QueryOptions() {
            }
            return QueryOptions;
        }());
        Data.QueryOptions = QueryOptions;
        /*
        // change this enum must by synchronize with enum in Enumeratory.cs
        export enum Operations {
            BeforeNow = 0,
            AfterNow = 1,
            Create = 2,
            Delete = 3,
            Edit = 4,
            NotEditableApply = 5,
            DeleteTemp = 6,
            CreateTemp = 7,
            NotEditable = 8,
            Actual = 9
        }
        */
    })(Data = AjaxCall.Data || (AjaxCall.Data = {}));
})(AjaxCall || (AjaxCall = {}));
// call REST operation by Api
(function (AjaxCall) {
    var RestSrv = /** @class */ (function () {
        function RestSrv() {
        }
        // post data
        RestSrv.prototype.postWebApi = function (queryO, convertToStringify, apiControlerName, listName, callbackFncOK, calbackFncFailData, calbackFncFailReq, runSync) {
            if (calbackFncFailData === void 0) { calbackFncFailData = null; }
            if (calbackFncFailReq === void 0) { calbackFncFailReq = null; }
            if (runSync === void 0) { runSync = true; }
            $.ajax({
                url: apiControlerName,
                beforeSend: function () {
                    $("#ajax-loader").removeClass("hidden");
                },
                cache: false,
                type: "POST",
                async: runSync,
                headers: {
                    'Accept': "application/json; charset=UTF-8",
                    'Content-Type': "application/json"
                },
                data: convertToStringify ? JSON.stringify(queryO) : queryO,
                processData: false,
            }).done(function (data) {
                if (data != undefined) {
                    callbackFncOK(data);
                    //TODO toto po vyrieseni logovania odkomentuj Logger.send(LogLevel.Info, "AjaxCall", "Loading list of " + listName + " on page - OK");
                }
                else {
                    if (calbackFncFailData == null) {
                        AjaxFail.getFailBox(listName, "errorGetData");
                    }
                    else {
                        calbackFncFailData();
                    }
                }
                $("#ajax-loader").addClass("hidden");
            }).fail(function (jqXHR, textStatus) {
                if (jqXHR.status == 401) {
                    // ajaxFail.getFailBox(listName, 'NoRights');
                    // window.location.href = "/Admin/Home/Login/";
                    window.location.href = Global.Variable.urlPrefix + "Admin/Home/LoginExpired";
                }
                else {
                    if (calbackFncFailReq == null) {
                        AjaxFail.getFailBox(listName, "errorRequestData");
                    }
                    else {
                        calbackFncFailReq(jqXHR, textStatus);
                    }
                }
                $("#ajax-loader").addClass("hidden");
            });
        };
        // autocomplet
        RestSrv.prototype.customAutocomplet = function (targetId, apiController, callbackFncOK, calbackFncFailReq) {
            if (callbackFncOK === void 0) { callbackFncOK = null; }
            if (calbackFncFailReq === void 0) { calbackFncFailReq = null; }
            $(document).ready(function () {
                var autocompleteIsSelect = false;
                $("#" + targetId).autocomplete({
                    source: function (request, response) {
                        //var autocompleteUrl = Global.Variable.urlPrefix + apiController + "?searchText=" + request.term;
                        var autocompleteUrl = Global.Variable.urlPrefix + apiController;
                        $.ajax({
                            url: autocompleteUrl,
                            data: { "searchText": request.term },
                            type: "GET",
                            cache: false,
                            dataType: "json",
                            success: function (json) {
                                response($.map(json, function (data, id) {
                                    return {
                                        label: data.ShowInAutocomplet,
                                        value: data.ShowInAutocomplet,
                                        allData: data
                                    };
                                }));
                            },
                            error: function (xmlHttpRequest, textStatus, errorThrown) {
                                AjaxFail.getFailBox("", "errorRequestData", false);
                            }
                        });
                    },
                    minLength: 1,
                    select: function (event, ui) {
                        if (callbackFncOK != null) {
                            callbackFncOK(ui);
                        }
                        else {
                            $("#" + targetId).val(ui.item.label);
                        }
                        autocompleteIsSelect = true;
                        console.log("Select-" + autocompleteIsSelect);
                    },
                    close: function (event, ui) {
                        console.log("Close-" + autocompleteIsSelect);
                        if (!autocompleteIsSelect) {
                            autocompleteIsSelect = false;
                            $("#" + targetId).val("");
                        }
                    }
                });
            });
        };
        // dropdown autocomplet
        RestSrv.prototype.customDropDownAutocomplete = function (targetId, apiController, callbackFncOK, calbackFncFailReq, elementId, itemType) {
            if (callbackFncOK === void 0) { callbackFncOK = null; }
            if (calbackFncFailReq === void 0) { calbackFncFailReq = null; }
            $(document).ready(function () {
                var autocompleteIsSelect = false;
                $("#" + targetId).autocomplete({
                    source: function (request, response) {
                        var test = $("#clickedId").val();
                        //var autocompleteUrl = Global.Variable.urlPrefix + apiController + "?searchText=" + request.term + "&itemId=" + $("#clickedId").val();
                        var autocompleteUrl = Global.Variable.urlPrefix + apiController;
                        $.ajax({
                            url: autocompleteUrl,
                            data: { "searchText": request.term, "itemId": elementId == "" ? "" : document.getElementById(elementId).innerText, "itemType": itemType },
                            type: "GET",
                            cache: false,
                            dataType: "json",
                            success: function (json) {
                                response($.map(json, function (data, id) {
                                    return {
                                        label: data.ShowInAutocomplet,
                                        value: data.ShowInAutocomplet,
                                        allData: data
                                    };
                                }));
                            },
                            error: function (xmlHttpRequest, textStatus, errorThrown) {
                                AjaxFail.getFailBox("", "errorRequestData", false);
                            }
                        });
                    },
                    minLength: 0,
                    select: function (event, ui) {
                        if (callbackFncOK != null) {
                            callbackFncOK(ui);
                        }
                        else {
                            $("#" + targetId).val(ui.item.label);
                        }
                        autocompleteIsSelect = true;
                        console.log("Select-" + autocompleteIsSelect);
                    },
                    close: function (event, ui) {
                        console.log("Close-" + autocompleteIsSelect);
                        if (!autocompleteIsSelect) {
                            autocompleteIsSelect = false;
                            $("#" + targetId).val("");
                        }
                    }
                }).focus(function () {
                    $(this).autocomplete("search");
                });
            });
        };
        // dropdown multiselect multiline autocomplet
        RestSrv.prototype.customDropDownMultiAutocomplete = function (targetId, apiController, callbackFncOK, calbackFncFailReq, count) {
            if (callbackFncOK === void 0) { callbackFncOK = null; }
            if (calbackFncFailReq === void 0) { calbackFncFailReq = null; }
            $(document).ready(function () {
                function split(val) {
                    //return val.split(/,\s*/);
                    return val.split("\n");
                }
                function extractLast(term) {
                    return split(term).pop();
                }
                var autocompleteIsSelect = false;
                $("#" + targetId).autocomplete({
                    minLength: 0,
                    source: function (request, response) {
                        //var autocompleteUrl = Global.Variable.urlPrefix + apiController + "?searchText=" + extractLast(request.term) + "&count=" + count;
                        var autocompleteUrl = Global.Variable.urlPrefix + apiController;
                        $.ajax({
                            url: autocompleteUrl,
                            data: { "searchText": extractLast(request.term), "count": count },
                            type: "GET",
                            cache: false,
                            dataType: "json",
                            success: function (json) {
                                response($.map(json, function (data, id) {
                                    return {
                                        label: data.ShowInAutocomplet,
                                        value: data.ShowInAutocomplet,
                                        allData: data
                                    };
                                }));
                            },
                            error: function (xmlHttpRequest, textStatus, errorThrown) {
                                AjaxFail.getFailBox("", "errorRequestData", false);
                            }
                        });
                    },
                    focus: function () {
                        // prevent value inserted on focus
                        return false;
                    },
                    select: function (event, ui) {
                        var terms = split(this.value);
                        // remove the current input
                        terms.pop();
                        // add the selected item
                        terms.push(ui.item.value);
                        // add placeholder to get the comma-and-space at the end
                        terms.push("");
                        //joing with new line in textarea
                        this.value = terms.join("\n"); //this.value = terms.join(", \n");
                        //move on the bottom of textarea
                        $(this).scrollTop(($(this))[0].scrollHeight);
                        if (callbackFncOK != null) {
                            callbackFncOK(ui);
                        }
                        else {
                            $("#" + targetId).val(ui.item.label);
                        }
                        autocompleteIsSelect = true;
                        console.log("Select-" + autocompleteIsSelect);
                        return false;
                    },
                    search: function (e, ui) {
                        $(this).data("ui-autocomplete").menu.bindings = $();
                    }
                }).focus(function () {
                    $(this).autocomplete("search");
                });
            });
        };
        return RestSrv;
    }());
    AjaxCall.RestSrv = RestSrv;
})(AjaxCall || (AjaxCall = {}));
;
var Modal;
(function (Modal) {
    var CreateWindow;
    (function (CreateWindow) {
        var ParametersModal = /** @class */ (function () {
            function ParametersModal() {
            }
            return ParametersModal;
        }());
        CreateWindow.ParametersModal = ParametersModal;
        var YesNoWindow = /** @class */ (function () {
            function YesNoWindow() {
            }
            YesNoWindow.prototype.createModal = function (paramM) {
                // var modal_fade = $(document.createElement('div')).addClass('modal-fade').attr('id', 'deleteYesNoModal').attr('role', 'dialog'); //this div must be created od page where will be modal window
                var modal_dialog = $(document.createElement("div")).addClass("modal-dialog");
                // modal_fade.append(modal_dialog); 
                var modal_content = $(document.createElement("div")).addClass("modal-content");
                modal_dialog.append(modal_content);
                var modal_header = $(document.createElement("div"))
                    .addClass("modal-header" + " " + paramM.TitleBgColorClass);
                modal_content.append(modal_header);
                var button_header = $(document.createElement("button")).addClass("close").attr("data-dismiss", "modal")
                    .html("&times;");
                modal_header.append(button_header);
                var tittle_header = $(document.createElement("h4")).addClass("modal-tittle").attr("id", paramM.TitleTextId);
                modal_header.append(tittle_header);
                var modal_body = $(document.createElement("div")).addClass("modal-body");
                var body_Text = $(document.createElement("p")).html(paramM.BodyText).attr("id", paramM.BodyTextId);
                modal_body.append(body_Text);
                modal_content.append(modal_body);
                var modal_footer = $(document.createElement("div")).addClass("modal-footer");
                var button_OK = $(document.createElement("button")).addClass("btn " + paramM.BtnOKBgColorClass)
                    .attr("data-dismiss", "modal").attr("id", paramM.BtnOKId).html(paramM.BtnOKText);
                var button_Cancel = $(document.createElement("button")).addClass("btn " + paramM.BtnCancelBgColorClass)
                    .attr("data-dismiss", "modal").attr("id", paramM.BtnCancelId).html(paramM.BtnCancelText);
                // add Cancel button only when id !=""
                if (paramM.BtnCancelId != "") {
                    modal_footer.append(button_Cancel);
                }
                //add OK button only when id !=""
                if (paramM.BtnOKId != "") {
                    modal_footer.append(button_OK);
                }
                modal_content.append(modal_footer);
                $("#" + paramM.DivIdForModal).append(modal_dialog);
            };
            return YesNoWindow;
        }());
        CreateWindow.YesNoWindow = YesNoWindow;
    })(CreateWindow = Modal.CreateWindow || (Modal.CreateWindow = {}));
})(Modal || (Modal = {}));
var Validation;
(function (Validation) {
    var Email = /** @class */ (function () {
        function Email() {
        }
        // is valid email enter?
        Email.prototype.validFormat = function (emailAddress) {
            var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return emailAddress.match(mailformat);
        };
        ;
        return Email;
    }());
    Validation.Email = Email;
})(Validation || (Validation = {}));
// #######  instancia triedy logovania  ##########################
var Logger = new AjaxCall.StatusLog.StatusLogAjax();
// pouzitie - priklad
// logger.send(LogLevel.Info, 'Global_MonitorConsole', 'Testovacia sprava - Start logovania JS');
// #######  instancia triedy lang  ##########################
var Lang = new AjaxCall.Langs.LocalizationAjax();
// pouzitie - priklad
// lang.getLang("LogOff");
// #######  instance class of UserRoles  ##########################
// nepouziva sa
// var userRoles = new AjaxCall.Roles.UserRoles();
// get roles actual user to Global Variable
// global.Variable.rolesActualUser = userRoles.getRoles();
// #########  instance class of ErrorBox  ###################
var AjaxFail = new AjaxCall.Error.ErrorBox();
var AjaxSuccess = new AjaxCall.Success.SuccessBox();
// example
// ajaxFail.getFailBox(tableName, errorMessage);
// #########  instance class of MessageBox  ###################
var AjaxMessage = new AjaxCall.Message.MessageBox();
// example
// ajaxMessage.getFailBox(someTitle, keyerrorMessage);
// #########  instance class modal...  ###################
var modalWinYesNo = new Modal.CreateWindow.YesNoWindow();
// modalWinYesNo.createModal(...parameters ...);
// #########  instance class AjaxCall.RestSrv ...  ###################
var ajaxCallRestSrv = new AjaxCall.RestSrv();
// example call metod
// ajaxCallRestSrv.postWebApi(..... parameters ...);
// ######### .............. Validacie ...........  ###################
var validateEmail = new Validation.Email();
// example call metod
// validateEmail.validFormat('someEmailAdress');
//# sourceMappingURL=Helpers.js.map