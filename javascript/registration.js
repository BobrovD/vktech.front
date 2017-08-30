/**
 * Created by Orange on 24.08.17.
 */


let reg_data = {};

let show_registration_row_details = (elem, action) => {
    let info = elem.parentNode.getElementsByClassName("info")[0];
    switch (action) {
        case 'show':
            info.style.display = 'block';
            break;
        case 'hide':
            if(elem.name === 'confirm_password'){
                if(elem.value === document.getElementById('reg_pwd').value) {
                    info.style.color = '#000000';
                    info.style.display = 'none';
                    reg_data.confirm_pwd = true;
                }else{
                    reg_data.confirm_pwd = false;
                    info.style.color = '#CC0000';
                }
                return true;
            }
            if(elem.name === 'email'){
                info.innerHTML = 'Email для входа в систему';
                info.style.color = '#000000';
            }
            if(validate_form(elem)) {
                reg_data[elem.name] = elem.value;
                info.style.color = '#000000';
                info.style.display = 'none';
            }else{
                delete reg_data[elem.name];
                info.style.color = '#CC0000';
            }
            break;
    }
};

let send_registration_form = () => {
   if(
       reg_data.fname !== undefined &&
       reg_data.sname !== undefined &&
       reg_data.email !== undefined &&
       reg_data.phone !== undefined &&
       reg_data.password !== undefined &&
       reg_data.confirm_pwd === true
   ){
        let on_send_request_to_server = (answ, xhr) => {
            if(answ.target.status === 400 && xhr.getResponseHeader('Error') === 'Account already exists'){
                delete reg_data.email;
                let email_input = document.getElementById('registration_email');
                let email_info = email_input.parentNode.getElementsByClassName("info")[0];
                email_info.innerHTML = 'Такой email уже существует';
                email_info.style.color = '#CC0000';
                email_input.focus();
                return false;
            }
            if(answ.target.status !== 200 )
                return false;
            app.pagemaker.show_message_page(reg_success_messages);
        };
        app.send_request_to_server('POST', 'index.php?r=user&a=new', reg_data, on_send_request_to_server, true);
   }
};

let reg_success_messages = {
    title : 'Регистрация прошла успешно!',
    text : 'Теперь войдите в свой аккаунт.'
};