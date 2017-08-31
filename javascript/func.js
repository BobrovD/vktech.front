/**
 * Created by Orange on 23.08.17.
 */


class Application {

    constructor () {
        this.pagemaker = new PageMaker();
        this.token = getCookie('Token');
        this.account_type = getCookie('Account-type');
        let date = new Date();
        this.timezoneOffset = date.getTimezoneOffset();
        if(this.token === undefined || this.account_type === undefined){
            this.pagemaker.hide_loader();
            this.pagemaker.print_auth_sidebar();
            this.pagemaker.print_global_task_list();
        }else{
            this.check_auth_data()
        }
    }

    check_auth_data () {
        let params = {
            token : this.token,
            account_type : this.account_type
        };
        let on_send_request_to_server = (answ, xhr) => {
            this.pagemaker.hide_loader();
            if(answ.target.status === 401){
                deleteCookie('Token');
                deleteCookie('Account-type');
                this.pagemaker.print_auth_sidebar();
            }
            if(answ.target.status === 200){
                this.user = JSON.parse(answ.target.responseText);
                this.pagemaker.print_authorized_sidebar(this.user);
                this.pagemaker.print_global_task_list();
                app.user = this.user;
            }
        };
        this.send_request_to_server('POST', 'index.php?r=auth&a=validate_auth', params, on_send_request_to_server);
    }

    sign_in (auth_elem) {
        let account_type = auth_elem.getElementsByClassName('sign_in_switcher')[0].getElementsByClassName('selected')[0].getAttribute('data-type');
        let email = document.getElementById('auth_email');
        let password = document.getElementById('auth_password');
        email.style.borderColor = '#CCCCCC';
        if(
            validate_form(email) &&
            validate_form(password) &&
            (
                account_type === 'customer' ||
                account_type === 'executor'
            )
        ){
            let on_send_request_to_server = (answ, xhr) => {
                if(answ.target.status === 200){
                    let answ_obj = JSON.parse(answ.target.responseText);
                    setCookie('Token', answ_obj.token);
                    setCookie('Account-type', answ_obj.account_type);
                    //и даже отключенные куки не дадут поломаться авторизации
                    app.token = answ_obj.token;
                    app.account_type = answ_obj.account_type;
                    location.reload();
                }else{
                    password.value = '';
                    email.style.borderColor = '#CC0000';
                    email.focus();
                }
            };
            this.send_request_to_server('PUT', 'index.php?r=auth&a=sign_in', {email : email.value, password: password.value, account_type: account_type}, on_send_request_to_server);
        }else{
            password.value = '';
            email.style.borderColor = '#CC0000';
            email.focus();
        }
    }

    sign_out () {
        let on_send_request_to_server = (answ) => {
            deleteCookie('Token');
            deleteCookie('Account-type');
            location.reload();
        };
        this.send_request_to_server('PUT', 'index.php?r=auth&a=sign_out', {token: this.token, account_type: this.account_type}, on_send_request_to_server);
    }

    send_request_to_server (method, url, params, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
        let token = this.token;
        let account_type = this.account_type;
        if(token !== undefined && account_type !== undefined){
            xhr.setRequestHeader('Token', token);
            xhr.setRequestHeader('Account-type', account_type);
        }
        //может когда-то пригодится
        //xhr.setRequestHeader('Client-Time-Offset', this.timezoneOffset);
        xhr.onreadystatechange = function(answ){
            if(answ.target.readyState === 4) {
                callback(answ, xhr);
            }
        };
        if(params !== undefined || params !== null){
            xhr.send(JSON.stringify(params));
        }else{
            xhr.send();
        }
    }
}

class PageMaker {

    constructor () {
        this.pointers = new Pointers();
        this.fade = new Fade();
        this.script_list = [];
    }

    print_auth_sidebar(){
        let ths = this;
        let on_load_page = function(answ){
            ths.pointers.leftSide.innerHTML = answ.target.responseText;
            if(app.account_type !== undefined){
                document.getElementById('sign_in_'+app.account_type).classList.add('selected');
                let another_type = app.account_type === 'executor' ? 'customer' : 'executor';
                document.getElementById('sign_in_'+another_type).classList.add('selected');
            }
        };
        this.load_page('sign_in_form.html', on_load_page)
    }

    print_global_task_list(){
        let ths = this;
        let on_load_page = (answ) => {
            ths.pointers.mainPage.innerHTML = answ.target.responseText;
            load_global_task_list();
        };
        let on_load_script = () => {
            ths.load_page('task_list.html', on_load_page)
        };
        this.load_script('task.js', on_load_script);
    }

    print_registration_form(){
        let ths = this;
        let on_load_page = (answ) => {
            ths.pointers.mainPage.innerHTML = answ.target.responseText;
        };
        let on_load_script = () => {
            ths.load_page('registration_form.html', on_load_page)
        };
        this.load_script('registration.js', on_load_script);
    }

    print_about_page(){
        let ths = this;
        let on_load_page = (answ) => {
            ths.pointers.mainPage.innerHTML = answ.target.responseText;
        };
        this.load_page('about.html', on_load_page)
    }

    print_authorized_sidebar(user){
        let ths = this;
        let on_load_page = (answ) => {
            ths.pointers.leftSide.innerHTML = answ.target.responseText;
            document.getElementById('user_data_name').innerHTML = user.fname + ' ' + user.sname;
            if(app.account_type === 'customer') {
                document.getElementById('user_data_balance').innerHTML = user.balance + '\u20bd';
                document.getElementById('user_data_balance').setAttribute('onclick', 'javascript:app.pagemaker.print_user_payment();return false;');
            }else if(app.account_type === 'executor') {
                document.getElementById('user_data_balance').innerHTML = user.salary + '\u20bd';
                document.getElementById('user_data_balance').setAttribute('onclick', 'javascript:app.pagemaker.print_user_payout();return false;');
            }
        };
        this.load_page('authorized_sidebar.html', on_load_page)
    }

    print_user_payment(){
        let ths = this;

        let on_load_page = (answ) => {
            ths.pointers.mainPage.innerHTML = answ.target.responseText;
            document.getElementById('balance_title').innerHTML += ' ' + app.user.balance + '\u20bd';
            document.getElementById('topup_summ').value = app.user.needed_payment === undefined ? '1000.00' : app.needed_payment;
            load_payment_history();
        };

        let on_load_script = () => {
            ths.load_page('payment.html', on_load_page);
        };

        this.load_script('payment.js', on_load_script);
    }

    print_user_payout(){
        let ths = this;

        let on_load_page = (answ) => {
            ths.pointers.mainPage.innerHTML = answ.target.responseText;
            document.getElementById('salary_title').innerHTML += ' ' + app.user.salary + '\u20bd';
            if(app.user.salary >= 1000.00){
                document.getElementById('payout_create').classList.remove('dn');
            }
            load_payout_history();
        };

        let on_load_script = () => {
            this.load_page('payout.html', on_load_page);
        };
        this.load_script('payout.js', on_load_script);
    }

    print_account_page(){
        let ths = this;
        let on_load_script = () => {
            ths.load_page('account.html', on_load_page);
        };
        let on_load_page = (answ) => {
            ths.pointers.mainPage.innerHTML = answ.target.responseText;
            document.getElementById('content_title').innerHTML = app.account_type === 'executor' ? 'Надёжный исполнитель ' + app.user.fname : 'Щедрый заказчик ' + app.user.fname;
            load_session_list();
        };
        this.load_script('account.js', on_load_script);
    }

    print_personal_task_list(){
        let ths = this;
        let on_load_page = (answ) => {
            ths.pointers.mainPage.innerHTML = answ.target.responseText;
            load_personal_task_list();
        };
        let on_load_script = () => {
            ths.load_page('task_list.html', on_load_page);
        };
        this.load_script('task.js', on_load_script);
    }

    print_task(task_id){
        let ths = this;
        let on_load_page = (answ) => {
            ths.pointers.mainPage.innerHTML = answ.target.responseText;
            load_task(task_id);
        };
        let on_load_script = () => {
            ths.load_page('task.html', on_load_page);
        };
        this.load_script('task.js', on_load_script);
    }

    print_loader(){
        console.log('loader on');//lets say no flashing
        this.fade.In(this.pointers.loader)
    }

    hide_loader(){
        console.log('loader off');//lets say no flashing
        this.fade.Out(this.pointers.loader)
    }

    show_message_page(message){
        let ths = this;
        let on_load_page = (answ) => {
            ths.pointers.mainPage.innerHTML = answ.target.responseText;
            document.getElementById('message_title').innerHTML = message.title;
            document.getElementById('message_text').innerHTML = message.text;
        };
        this.load_page('blank_message.html', on_load_page);
    }

    load_page(file, callback, loader = false){
        let ths = this;
        if(loader)
            ths.print_loader();
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/html/' + file, true);
        xhr.onreadystatechange = function(answ){
            if(answ.target.readyState === 4) {
                if(loader)
                    ths.hide_loader();
                callback(answ);
            }
        };
        xhr.send();
    }

    load_script(file, onload = undefined){

        if(this.script_list[file] !== undefined){
            if(onload !== undefined)
                onload();
            return true;
        }
        this.script_list[file] = true;
        let script = document.createElement('script');
        script.src = '/javascript/' + file;
        script.type = 'text/javascript';
        if(onload !== undefined)
            script.onload = onload;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

}

class Pointers {
    constructor() {
        this.loader = document.getElementById('loader_container');
        this.leftSide = document.getElementById('left_side_container');
        this.mainPage = document.getElementById('main_container');
    }
}

//общий таймер для проявления и скрытия, что бы не было конфликтов при быстром проявлении
let timer;

class Fade {

    Out(element){
        let op = 1;  // initial opacity
        clearInterval(timer);
        timer = setInterval(function () {
            if (op <= 0.1){
                clearInterval(timer);
                element.style.display = 'none';
            }
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op -= 0.1;
        }, 10);
    }

    In(element) {
        let op = 0;  // initial opacity
        element.style.display = 'block';
        clearInterval(timer);
        timer = setInterval(function () {
            if (op >= 1) {
                clearInterval(timer);
            }
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op += 0.1;
        }, 10);
    }
}

let select_account_type = (elem) => {
    let elem_list = elem.parentNode.getElementsByTagName("div");
    for(let i = 0; i<elem_list.length; i++){
        elem_list[i].classList.remove('selected');
    }
    elem.classList.add('selected');
};

let setCookie = (name, value, options) => {
    options = options || {};

    let expires = options.expires;

    if (typeof expires === "number" && expires) {
        let d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    let updatedCookie = name + "=" + value;

    for (let propName in options) {
        updatedCookie += "; " + propName;
        let propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
};

let getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
};

let deleteCookie = (name) => {
    setCookie(name, "", {
        expires: -1
    })
};

let validate_form = (row) => {
    let type = row.name;
    switch(type){
        case 'fname':
            re = /^[a-zA-Zа-яА-ЯёЁ]{2,30}$/;
            break;
        case 'sname':
            re = /^[a-zA-Zа-яА-ЯёЁ\-]{2,30}$/;
            break;
        case 'phone':
            re = /(^(?!\+.*\(.*\).*\-\-.*$)(?!\+.*\(.*\).*\-$)(\+[0-9]{1,3}\([0-9]{1,3}\)[0-9]{1}([-0-9]{0,8})?([0-9]{0,1})?)$)|(^[0-9]{1,4}$)/;
            break;
        case 'email':
            re = /^(?!.*@.*@.*$)(?!.*@.*\-\-.*\..*$)(?!.*@.*\-\..*$)(?!.*@.*\-$)(.*@.+(\..{1,11})?)$/;
            break;
        case 'password':
            re = /^[a-zA-Z0-9\-\!\_\#\%]{6,20}$/;
            break;
        case 'summ':
            re = /^([0-9]{1,6})(([\.]{1})([0-9]{2,2}))?$/;
            break;
        case 'task_text':
            re = /^([a-zA-Zа-яА-ЯёЁ0-9\n\s!'\"№;%:\?\*\(\)_\-\+\=\.,\\/#\$]){10,1000}$/
            break;
        case 'task_title':
            re = /^([a-zA-Zа-яА-ЯёЁ0-9\s!'\"№;%:\?\*\(\)_\-\+\=\.,\\/#\$]){4,100}$/
            break;
        default:
            return false;
            break;
    }
    return re.test(row.value);
};

let drop_password = (email) => {
    if(!validate_form(email)){
        email.focus();
        email.style.borderColor = '#CC0000';
        return false;
    }
    let on_send_request_to_server = (answ) => {
        email.style.borderColor = '#00CC00';
        document.getElementById('auth_password').focus();
    };
    app.send_request_to_server('PUT', 'index.php?r=auth&a=drop_pwd', {email: email.value}, on_send_request_to_server)
};