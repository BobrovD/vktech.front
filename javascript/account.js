/**
 * Created by Orange on 29.08.17.
 */


let load_session_list = () => {
    let on_send_request_to_server = (answ) => {
        let data = JSON.parse(answ.target.responseText);
        if(data.count === 0){//быть не может
            location.reload();
        }else{
            print_session_list(data)
        }
    };
    app.send_request_to_server('GET', 'index.php?r=auth&a=session_list', {}, on_send_request_to_server);
};

let print_session_list = (data) => {
    let sessions = data.session_list;
    let session_table = document.getElementById('session_list');
    for(let k in sessions){
        let tr = document.createElement('tr');
        let tdid = document.createElement('td');
        let tdip = document.createElement('td');
        let tddevice = document.createElement('td');
        let tdacc = document.createElement('td');
        let tdonline = document.createElement('td');
        let tdclose = document.createElement('td');
        tr.setAttribute('id', 'session-id' + sessions[k].row_id);
        tdid.innerHTML = sessions[k].row_id;
        tdip.innerHTML = sessions[k].ip;
        tddevice.innerHTML = sessions[k].user_agent;
        tdacc.innerHTML = sessions[k].account_type === 'customer' ? 'Заказчик' : 'Исполнитель';
        let date = new Date((parseInt(sessions[k].last_active)) * 1000 + parseInt(app.timezoneOffset));
        let day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay();
        let month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
        let year = date.getFullYear();
        let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        let sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        tdonline.innerHTML = day + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec;
        tdclose.innerHTML = '<a href="#" onclick="close_session('+sessions[k].row_id+')">Завершить</a>';
        tr.appendChild(tdid);
        tr.appendChild(tdip);
        tr.appendChild(tddevice);
        tr.appendChild(tdacc);
        tr.appendChild(tdonline);
        tr.appendChild(tdclose);
        session_table.appendChild(tr);
    }
};

let update_account_data = (elem) => {
    let inputs = elem.parentNode.getElementsByTagName('input');
    if(elem.getAttribute('data-action') === 'edit'){
        for(let k in inputs){
            inputs[k].removeAttribute('disabled');
        }
        elem.innerHTML = 'Сохранить';
        elem.setAttribute('data-action', 'save')
    }
    if(elem.getAttribute('data-action') === 'save') {
        let new_user;
        for (let k in inputs) {
            new_user[inputs[k].getAttribute('name')] = inputs[k].value;
        }

    }
};

let send_user_data_to_server = (data) => {

    let on_send_request_to_server = (answ) => {
        if(answ.target.status === 200){
            location.reload();
        }
    };
    app.send_request_to_server('PUT', 'index.php?r=user&a=update', data, on_send_request_to_server);
};

let close_session = (session_id) =>{
    let on_send_request_to_server = (answ) => {
        if(answ.target.status === 200){
            document.getElementById('session-id' + session_id).remove();
        }
    };
    app.send_request_to_server('PUT', 'index.php?r=auth&a=close_session', {session_id: session_id}, on_send_request_to_server);
};