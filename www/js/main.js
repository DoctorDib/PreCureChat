var socket = io();

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

			    <h1 id='launcherTitle'> PreCure </h1>

                <div id="register" class="register">
    				<button onClick={login} class="btn-close">X</button>
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

			    <h1 id='launcherTitle'> PreCure </h1>

    			<div id="forgotPass" class="forgotPass">
    				<button onClick={login} class="btn-close">X</button>
    				<label for="regEmail">Email</label>
    				<input name="Email" id="fpEmail"/>
    				<button onclick='forgotPassword()' id="forgotPass-btn">Send email</button>
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

			    <h1 id='launcherTitle'> PreCure </h1>

                <div id="login">
    				<input title="Username" id="loginUName"/>
    				<input title="Password" type="password" id="loginPWord"/>
    				<div id="loginButtons">
    					<button onclick='loginUser()' styles="float: right;">Login</button>
    					<button onClick={register}>Register</button>
    				</div>
    				<a onClick={forgotPassword} styles='cursor:pointer; display: none;'> FORGOT PASSWORD </a>
    			</div>
            </section>
		);
	}
};

React.render(<Login />, document.getElementById('main'));
