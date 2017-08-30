/**
 * Created by Orange on 29.08.17.
 */

let create_payout = (button) => {
    let on_send_request_to_server = (answ) => {
        if(answ.target.status === 400){
            button.classList.add('unactive');
        }
        clear_payout_list();
        load_payout_history();
    };
    app.send_request_to_server('GET', 'index.php?r=payout&a=new', {}, on_send_request_to_server)
};

let load_payout_history = () => {
    let on_send_request_to_server = (answ) => {
        let message = '';
        if(answ.target.status !== 200) {
            message = 'Что-то пошло не так';
        }else{
            let data = JSON.parse(answ.target.responseText);
            if(data.count > 0){
                document.getElementById('payout_history').classList.toggle('dn', false);
                return print_payout_history(data);
            }else{
                document.getElementById('no_data_payout').classList.toggle('dn', false);
            }
        }
    };
    app.send_request_to_server('GET', 'index.php?r=payout&a=get_list', {}, on_send_request_to_server);
};

let print_payout_history = (data) => {
    let payouts = data.payouts;
    for(let k in payouts){
        add_payout_to_existing_list_in_start(payouts[k]);
    }
    document.getElementById('payout_history').classList.remove('dn');
};

let add_payout_to_existing_list_in_start = (payout) => {
    let payout_table = document.getElementById('payout_history');
    let payout_row = document.createElement('tr');
    let pid = document.createElement('td');
    pid.setAttribute('class', payout.status);
    let pip = document.createElement('td');
    let psumm = document.createElement('td');
    let pmethod = document.createElement('td');
    let ptime = document.createElement('td');
    let pstatus = document.createElement('td');
    pstatus.setAttribute('class', payout.status);
    pid.innerHTML = payout.payout_id;
    pip.innerHTML = payout.user_ip;
    psumm.innerHTML = payout.summ;
    pmethod.innerHTML = payout.method;
    let date = new Date((parseInt(payout.time)) * 1000 + parseInt(app.timezoneOffset));
    let day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay();
    let month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    let year = date.getFullYear();
    let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    ptime.innerHTML = day + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec;
    pstatus.innerHTML = payout.status;
    payout_row.appendChild(pid);
    payout_row.appendChild(pstatus);
    payout_row.appendChild(psumm);
    payout_row.appendChild(pmethod);
    payout_row.appendChild(ptime);
    payout_row.appendChild(pip);
    payout_table.appendChild(payout_row);
};

let clear_payout_list = () => {
    document.getElementById('payout_history').innerHTML = '<tr id="payout_first_tr"><th width="5%">ID</th><th width="15%">Статус</th><th width="15%">Сумма</th><th width="15%">Способ</th><th width="30%">Время</th><th width="20%">IP</th></tr>';
};