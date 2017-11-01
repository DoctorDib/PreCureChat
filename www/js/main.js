const socket = io();

socket.on('login_response', function(response){
	if(response.result === 'success'){
		React.render(<Chat />, document.getElementById('main'));
	} else {
		console.log(response.reason);
	}
});

socket.on('register_response', function(response){
	if(response.result === 'success'){
		React.render(<Login />, document.getElementById('main'));
	} else {
		console.log(response.reason);
	}
});

//================================================================================================================
// Page functions - Switches between pages
//================================================================================================================

forgotPassword = () => {
    React.render(<ForgotPass />, document.getElementById('main'));
};

login = () => {
    React.render(<Login />, document.getElementById('main'));
};

register = () => {
    React.render(<Register />, document.getElementById('main'));
};


sendRegister = () => {
	let uName = jQuery('#reg-username')[0].value;
	let dName = jQuery('#reg-displayname')[0].value;
	let email = jQuery('#reg-email')[0].value;
	let pass = jQuery('#reg-password')[0].value;

	socket.emit('register_request', {'uName': uName, 'dName': dName, 'email': email, 'pass': pass})
};

sendLogin = () => {
	let uName = jQuery('#login-username')[0].value;
	let pass = jQuery('#login-password')[0].value;

	socket.emit('login_request', {'uName': uName, 'pass': pass})
};

//================================================================================================================
// HTML section
//================================================================================================================

//==============================================================================
// Chatting Page
//==============================================================================
class Chat extends React.Component {
    render() {
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
};

//==============================================================================
// Launcher page                                            (POSSIBLY REDUNDANT)
//==============================================================================
class Launcher extends React.Component {
	render(){
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
};

//==============================================================================
// Register page
//==============================================================================
class Register extends React.Component {
	render(){
		return (
            <section id='launcher'>

			    <h1 id='launcher-title'> PreCure </h1>
                <button id="btn-back" onClick={login} >&lt; Go Back</button>

                <div id="register">
    				<div id="regError"></div>

    				<label>Username
    				    <input name="Username" id="reg-username"/>
                    </label>

    				<label>Display Name
    				    <input name="DisplayName" id="reg-displayname"/>
                    </label>

    				<label>Email
    				    <input name="Email" id="reg-email"/>
                    </label>

    				<label>Password
    				    <input name="Password" type="password" id="reg-password"/>
                    </label>

    				<label>Confirm Password
    				    <input name="Password" type="password" id="reg-password-c"/>
                    </label>

    				<button onClick={sendRegister} id="register-btn">Register</button>
    			</div>
            </section>
		);
	}
};

//==============================================================================
// Forgot Password page
//==============================================================================
class ForgotPass extends React.Component {
	render(){
		return (
            <section id='launcher'>

			    <h1 id='launcher-title'> PreCure </h1>
                <button id="btn-back" onClick={login} >&lt; Go Back</button>

    			<div id="forgot-pass">
    				<label>Email
    				    <input name="Email" id="fp-email"/>
                    </label>
    				<button onClick={forgotPassword} id="forgotPass-btn">Send email</button>
    			</div>
            </section>
		);
	}
};

//==============================================================================
//Login page
//==============================================================================
class Login extends React.Component {
    render(){
		return (
            <section id='launcher'>
			    <h1 id='launcher-title'> PreCure </h1>
                <form id="login">
                    <label>Username:
    				    <input type="text" title="Username" id="login-username"/>
                    </label>

                    <label>Password:
    				    <input title="Password" type="password" id="login-password"/>
                    </label>

                    <button onClick={sendLogin}>Login</button>
    				<a onClick={forgotPassword}> Forgot your password? </a>
    			</form>

                <button id="btn-register" onClick={register}>Register</button>
            </section>
		);
	}
};

React.render(<Login />, document.getElementById('main'));
