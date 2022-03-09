//  Copyright 2010-2020 Robert Bosch Car Multimedia GmbH
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

'use strict';

function doGenericLogin(response){
   $('#badgeUser').removeClass("hide");
   $('#badgeUserText').text(response['displayName'].split(" ")[1].charAt(0).toUpperCase());
   $('#badgeUserText').attr('data-original-title', response['displayName']);
   
   $('#badgeUserText').css('background-color',getUserColor(response['displayName']));
   
	   
   $('#ddLogin').addClass("disabled");
   $('#ddLogout').removeClass("disabled");
   $('#ddLogoutTxt').html("<i class=\"fa fa-sign-out fa-fw\"></i> Logout "+response['usr']+"</a>");
}

function doGenericLogout(){
   $('#badgeUser').addClass("hide");
   $('#badgeUserText').text("-");
   $('#badgeUserText').attr('data-original-title', '-');
	  
   $('#ddLogin').removeClass("disabled");
   $('#ddLogout').addClass("disabled");
   $('#ddLogoutTxt').html("<i class=\"fa fa-sign-out fa-fw\"></i> Logout</a>");
}

function doSpecificLogin(response){
   $('#btnEditResultInterpretationEdit').removeClass("hide");
   $('#btnEditResultInterpretationSave').removeClass("hide");
   $('#btnEditResultInterpretation').removeClass("hide");
   $(".bootstrap-tagsinput > input").removeClass("hidden");
}

function doSpecificLogout(){
   $('#btnEditResultInterpretationEdit').addClass("hide");
   $('#btnEditResultInterpretationSave').addClass("hide");
   $('#btnEditResultInterpretation').addClass("hide");
   $(".bootstrap-tagsinput > input").addClass("hidden");
}

function loggedIn(){	
	getFromDB("/loggedin",'',function(response){
		//console.log(response);
		
		if (response['admin']==true){
		   doGenericLogin(response);
		   doSpecificLogin(response);

		} //if
	});
};

function isLoggedIn(){
   return  !$('#badgeUser').hasClass("hide");
};

function getDisplayName(){
   return $('#badgeUserText').attr('data-original-title');
};

function getUser(){
   return $('#ddLogoutTxt').text().split(" ")[2];
};

function getLogin(inputUsr, inputDom, inputPwd){
	var usr=inputUsr.val();
	var dom=inputDom.val();
	var pwd=inputPwd.val();
	
	getFromDB( "/getPubKey",'',
		       function(response){   
	            //console.log(response['pubKey']);
	
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(response['pubKey']);
                var pwdEncrypted = encrypt.encrypt(pwd);
   
            	 postToDB("/login",{ 'usr' : usr, 
            		                  'dom' : dom, 
            		                  'pwd' : pwdEncrypted}, function(response){
            		console.log(response);
            		
            		if (response['data']=="login_success"){
            		   inputPwd.val("");	
            		   
            		   doGenericLogin({ 'usr' :  usr, 'displayName' : response['displayName']});
            		   doSpecificLogin({ 'usr' :  usr, 'displayName' : response['displayName']});
            		   $('#txtWrongLogin').addClass("hide");
            		   $('#loginModal').modal("hide");
            		   //new login-dependent buttons need to be visible now, therefore reload the current page.
            		   window.location.reload(true); 

            	    } else
            	    {
            	    	$('#txtWrongLogin').removeClass("hide").hide().slideDown(500);
            	    }
            	}); // postToDB "/login"
                
               } // function(response)
	         ); // getFromDB
};

function setLogout(){
	getFromDB("/logout",'',function(response){
		console.log(response);
		
		if (response['data']=="logout_success"){
	      doGenericLogout();
		   doSpecificLogout();
		   //visible login-dependent buttons need to be invisible now, therefore reload the current page.
		   window.location.reload(true); 
		}
	});
}