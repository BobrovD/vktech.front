/**
 * Created by Orange on 30.08.17.
 */


let show_hide_add_task_form = () => {
    document.getElementById('add_task_container').classList.toggle('dn')
};

let send_new_task = () => {
    let task_title = document.getElementById('new_task_title');
    let task_text = document.getElementById('new_task_text');
    let task_reward = document.getElementById('new_task_reward');
    let send = true;
    if(!validate_form(task_title)){
        send = false;
        task_title.style.borderColor = '#CC0000';
    }
    if(!validate_form(task_text)){
        send = false;
        task_text.style.borderColor = '#CC0000';
    }
    if(!validate_form(task_reward)){
        send = false;
        task_reward.style.borderColor = '#CC0000';
    }
    if(send){
        let on_send_request_to_server = (answ) => {
            if(answ.target.status !== 200){
                task_reward.value = app.user.balance;
                task_reward.style.borderColor = '#CC0000';
            }
            else{
                clear_new_task();
                clear_task_list();
                load_task_list();
            }
        };
        app.send_request_to_server('POST', 'index.php?r=task&a=new', {task_title: task_title.value ,task_text: task_text.value , task_reward: task_reward.value }, on_send_request_to_server)
    }
};

let load_task_list = () => {
    let on_send_request_to_server = (answ) => {
        if(answ.target.status !== 200)
            return false;
        let data = JSON.parse(answ.target.responseText);
        if(data.count === 0){
            document.getElementById('no_data_task').classList.toggle('dn', false);
            return false;
        }
        document.getElementById('customer_task_list').classList.toggle('dn', false);
        print_tasks(data.tasks);
    };
    app.send_request_to_server('GET', 'index.php?r=task&a=get_my', {}, on_send_request_to_server);
};

let print_tasks = (tasks) => {
    let table = document.getElementById('customer_task_list');
    for(let k in tasks){
        let tr = document.createElement('tr');
        let tid = document.createElement('td');
        let ttitle = document.createElement('td');
        let tstatus = document.createElement('td');
        let texecutor = document.createElement('td');
        let treward = document.createElement('td');
        tid.innerHTML = tasks[k].task_id;
        ttitle.innerHTML = '<a href="#" onclick="javascript:app.pagemaker.print_task_to_customer('+tasks[k].task_id+');return false;">' + tasks[k].title + '</a>';
        ttitle.classList.add('taleft');
        tstatus.innerHTML = tasks[k].status;
        texecutor.innerHTML = parseInt(tasks[k].executor.id) === 0 ? '&mdash;' : tasks[k].executor.name;
        treward.innerHTML = tasks[k].reward;
        tr.appendChild(tid);
        tr.appendChild(ttitle);
        tr.appendChild(tstatus);
        tr.appendChild(texecutor);
        tr.appendChild(treward);
        table.appendChild(tr);
    }
};

let clear_task_list = () => {
    document.getElementById('customer_task_list').innerHTML = '<tr><td width="5%">ID</td><td width="45%" class="taleft">Название</td><td width="10%">Статус</td><td width="20%">Исполнитель</td><td width="20%">Стоимость</td></tr>';
};

let clear_new_task = () => {
    document.getElementById('new_task_title').innerHTML = '';
    document.getElementById('new_task_text').innerHTML = '';
    document.getElementById('new_task_reward').innerHTML = '';
    document.getElementById('add_task_container').classList.add('dn');
};

let load_task_to_customer = (task_id) => {
    let on_send_request_to_server = (answ) => {
        if(answ.target.status !== 200)
            return false;
        let task = JSON.parse(answ.target.responseText);
        print_task(task);
    };
    app.send_request_to_server('GET', 'index.php?r=task&a=get_by_id&task_id='+task_id, on_send_request_to_server);
};

let print_task = (task) => {
    console.log(task);
};