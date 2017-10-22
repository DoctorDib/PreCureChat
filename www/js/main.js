var socket = io();

//======================================================================================================================
// Chatting Page
//======================================================================================================================
var Chat = React.createClass({
    render: function () {
        return (
             <div id="main-container">
				<section id='main-content'>
					<ul id="messages" class="custom-scroll"></ul>
					<form action="" id="messageInput">
						<p class="typing"> </p>
						<input id="m" autocomplete="off" autofocus/>
						<button id="desktop-send">Send</button>
						<button id="mobile-send"></button>
					</form>
				</section>

				<section id="right-menu">
					<section id="menu-control">
						<button onclick='connectToRoom("test")'>Join Test</button>
						<button onclick='connectToRoom("testicles")'>Join Testicles</button>
					</section>

					<section id="server-online">
						<p id='num_of_people'>Online:</p>
						<ul id="listed_people"></ul>
					</section>

					<section id="user-search">
						<div id="search_bar">
							<input id='search_user' onkeyup="searchKeyUp()"/>
						</div>
						<div id='user_search_results'></div>

						<p> Friends online </p>
						<ul id="onlineFriends"></ul>
						<p> Friends offline </p>
						<ul id="offlineFriends"></ul>
					</section>
				</section>
			</div>
        );
    }
});

//======================================================================================================================
// Launcher page 
//======================================================================================================================
var Launcher = React.createClass({
	render: function(){
		return (
			<section id='launcher'>

			<h1 id='launcherTitle'> PreCure </h1>

			{/*<div id="redundantLogin">
					<input id='launcherInput'> </input>
					<button onclick='submit()' id='launcherButton'> Enter Room </button>
			</div>*/}

			</section>
		);
	}
})

//======================================================================================================================
// Register page 
//======================================================================================================================
var Register = React.createClass({
	render: function(){
		return (
			<div id="register" class="register">
				<button onclick='toggleRegister()' class="btn-close">X</button>
				<div id="regError"></div>
				<label for="regUName">Username</label>
				<input name="Username" id="regUName"/>
				<label for="regDName">Display Name</label>
				<input name="DisplayName" id="regDName"/>
				<label for="regEmail">Email</label>
				<input name="Email" id="regEmail"/>
				<label for="regPWord">Password</label>
				<input name="Password" type="password" id="regPWord"/>
				<label for="regPWordC">Confirm Password</label>
				<input name="Password" type="password" id="regPWordC"/>
				<button onclick='signupAcc()' id="register-btn">Register</button>
			</div>
		);
	}
})

//======================================================================================================================
// Forgot Password page 
//======================================================================================================================
var ForgotPassword = React.createClass({
	render: function(){
		return (
			<div id="forgotPass" class="forgotPass">
				<button onclick='toggleForgotPass()' class="btn-close">X</button>
				<label for="regEmail">Email</label>
				<input name="Email" id="fpEmail"/>
				<button onclick='forgotPassword()' id="forgotPass-btn">Send email</button>
			</div>
		);
	}
})

//======================================================================================================================
//Login page 
//======================================================================================================================
var Login = React.createClass({
	render: function(){
		return (
			<div id="login">
				<input title="Username" id="loginUName"/>
				<input title="Password" type="password" id="loginPWord"/>
				<div id="loginButtons">
					<button onclick='loginUser()' styles="float: right;">Login</button>
					<button onclick='toggleRegister()'>Register</button>
				</div>
				<a onclick='toggleForgotPass()' styles='cursor:pointer; display: none'> FORGOT PASSWORD OMGOMGOMG </a>
			</div>
		);
	}
});

React.render(<Launcher />, document.getElementById('main'));