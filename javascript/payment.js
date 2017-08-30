/**
 * Created by Orange on 28.08.17.
 */

let load_payment_history = () => {
    let on_send_request_to_server = (answ) => {
        let message = '';
        if(answ.target.status !== 200) {
            return false;
        }else{
            let data = JSON.parse(answ.target.responseText);
            if(data.count > 0){
                document.getElementById('payment_history').classList.remove('dn');
                return print_payment_history(data)
            }else{
                document.getElementById('no_data_payment').classList.remove('dn');
            }
        }
    };
    app.send_request_to_server('GET', 'index.php?r=payment&a=get_list', {}, on_send_request_to_server);
};

let print_payment_history = (data) => {
    let payments = data.payments;
    let payment_table = document.getElementById('payment_history');
    for(let k in payments){
        let payment_row = document.createElement('tr');
        let pid = document.createElement('td');
        pid.setAttribute('class', payments[k].status);
        let pip = document.createElement('td');
        let psumm = document.createElement('td');
        let ptime = document.createElement('td');
        let pstatus = document.createElement('td');
        pstatus.setAttribute('class', payments[k].status);
        pid.innerHTML = payments[k].payment_id;
        pip.innerHTML = payments[k].user_ip;
        psumm.innerHTML = payments[k].summ;
        let date = new Date((parseInt(payments[k].time)) * 1000 + parseInt(app.timezoneOffset));
        let day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay();
        let month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
        let year = date.getFullYear();
        let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        let sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        ptime.innerHTML = day + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec;
        pstatus.innerHTML = payments[k].status;
        payment_row.appendChild(pid);
        payment_row.appendChild(pstatus);
        payment_row.appendChild(psumm);
        payment_row.appendChild(ptime);
        payment_row.appendChild(pip);
        payment_table.appendChild(payment_row);
    }
    document.getElementById('payment_history').classList.remove('dn');
};

let init_payment_request = (summ) => {
    if(!validate_form(summ)){
        summ.focus();
        summ.style.borderColor = '#CC0000';
        return false;
    }
    let on_send_request_to_server = (answ) => {
        if(answ.target.status !== 200){
            //а вообще вероятно что-то не так с сервером
            summ.focus();
            summ.style.borderColor = '#CC0000';
            return false;
        }
        let payment = JSON.parse(answ.target.responseText);
        let form = document.getElementById('topup_balance_form');
        let inputs = form.getElementsByTagName('input');
        inputs[0].value = payment.MerchantLogin;
        inputs[1].value = payment.OutSum;
        inputs[2].value = payment.InvoiceID;
        inputs[3].value = payment.InvDesc;
        inputs[4].value = payment.SignatureValue;
        form.submit();
    };
    app.send_request_to_server('GET', 'index.php?r=payment&a=new&summ='+summ.value, {}, on_send_request_to_server);
};