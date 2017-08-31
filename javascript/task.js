/**
 * Created by Orange on 30.08.17.
 */


let show_hide_add_task_form = () => {
    document.getElementById('add_task_container').classList.toggle('dn')
};

let send_new_task = () => {
    let task_title = document.getElementById('task_title');
    let task_text = document.getElementById('task_text');
    let task_reward = document.getElementById('task_reward');
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
        send_task_to_server({task_title: task_title.value ,task_text: task_text.value , task_reward: task_reward.value}, 'new');
    }
};

let load_global_task_list = () => {
    let on_send_request_to_server = (answ) => {
        if(answ.target.status !== 200)
            return false;
        let data = JSON.parse(answ.target.responseText);
        if(data.count === 0){
            document.getElementById('no_data_task').classList.toggle('dn', false);
            return false;
        }
        print_tasks(data.tasks);
    };
    app.send_request_to_server('GET', 'index.php?r=task&a=get_global_list', {}, on_send_request_to_server);
};

let load_personal_task_list = () => {
    let on_send_request_to_server = (answ) => {
        if(answ.target.status !== 200)
            return false;
        let data = JSON.parse(answ.target.responseText);
        switch(app.account_type){
            case 'customer':
                document.getElementById('add_task_button').classList.toggle('dn');
                document.getElementById('content_title_text').innerHTML = 'Мои задачи';
                break;
        }
        if(data.count === 0){
            document.getElementById('no_data_task').classList.toggle('dn', false);
            return false;
        }
        document.getElementById('task_list').classList.toggle('dn', false);
        print_tasks(data.tasks);
    };
    app.send_request_to_server('GET', 'index.php?r=task&a=get_my', {}, on_send_request_to_server);
};

let print_tasks = (tasks) => {
    let table = document.getElementById('task_list');
    for(let k in tasks){
        let tr = document.createElement('tr');
        let tid = document.createElement('td');
        let ttitle = document.createElement('td');
        let tstatus = document.createElement('td');
        let texecutor = document.createElement('td');
        let treward = document.createElement('td');
        tid.innerHTML = tasks[k].task_id;
        ttitle.innerHTML = '<a href="#" onclick="javascript:app.pagemaker.print_task('+tasks[k].task_id+');return false;">' + tasks[k].title + '</a>';
        ttitle.classList.add('taleft');
        tstatus.innerHTML = tasks[k].status;
        tstatus.classList.add(tasks[k].status);
        texecutor.innerHTML = parseInt(tasks[k].executor.id) === 0 ? '&mdash;' : tasks[k].executor.name;
        treward.innerHTML = tasks[k].reward;
        tr.appendChild(tid);
        tr.appendChild(ttitle);
        tr.appendChild(tstatus);
        tr.appendChild(texecutor);
        tr.appendChild(treward);
        table.appendChild(tr);
    }
    table.classList.toggle('dn', false);
};

let clear_task_list = () => {
    document.getElementById('task_list').innerHTML = '<tr><td width="5%">ID</td><td width="45%" class="taleft">Название</td><td width="10%">Статус</td><td width="20%">Исполнитель</td><td width="20%">Стоимость</td></tr>';
};

let print_task = (task) => {
    let container = document.getElementById('task_container');
    let title = document.getElementById('task_title');
    let text = document.getElementById('task_text');
    let reward = document.getElementById('task_reward');
    let status = document.getElementById('task_status');
    let top_button = document.getElementById('top_task_button');
    let bottom_button = document.getElementById('bottom_task_button');
    let bottom_container = document.getElementById('bottom_container');
    switch(app.account_type){
        case 'customer':
            if(task.status === 'actual'){
                bottom_button.setAttribute('onclick', 'javascript:edit_task(this);return false;');
                bottom_button.innerHTML = 'Редактировать';
                bottom_button.classList.toggle('dn', false);
            }
            if(task.status === 'actual' && task.executor.list.length > 0){
                for (let k in  task.executor.list){
                    let a = document.createElement('a');
                    a.setAttribute('onclik', 'javascript:choose_executor('+task.executor.list[k].id+')');
                    a.innerHTML = task.executor.list[k].name;
                    bottom_container.appendChild(a);
                }
                bottom_container.classList.toggle('dn', false);
                bottom_container.firstElementChild.innerHTML = 'Выберите исполнителя: '
            }
            if(task.executor.list.length === 0){
                bottom_container.classList.toggle('dn', false);
                bottom_container.firstElementChild.innerHTML = 'Пока что никто не предложил себя в качестве исполнителя задания.'
            }
            title.value = task.title;
            text.innerHTML = task.description;
            reward.value = task.reward;
            status.innerHTML = task.status;
            status.setAttribute('data-status', task.status);
            status.classList.add(task.status);
            status.setAttribute('data-task_id', task.task_id);
            container.classList.toggle('dn', false);
            top_button.innerHTML = 'Мои задачи';
            top_button.setAttribute('onclick', 'javascript:app.pagemaker.print_personal_task_list();return false;');
            top_button.classList.toggle('dn', false);
            break;
        case 'executor':
            if(task.status === 'actual' && task.is_im_subscriber === null){
                bottom_button.setAttribute('onclick', 'javascript:subscribe_task('+task.task_id+');return false;');
                bottom_button.innerHTML = 'Я это выполню!';
                bottom_button.classList.toggle('dn', false);
            }else if(task.status === 'actual' && task.is_im_subscriber){
                bottom_button.setAttribute('onclick', 'javascript:subscribe_task('+task.task_id+', false);return false;');
                bottom_button.innerHTML = 'Отказаться';
                bottom_button.classList.toggle('dn', false);
            }
            title.value = task.title;
            text.innerHTML = task.description;
            reward.value = task.reward;
            status.innerHTML = task.status;
            status.setAttribute('data-status', task.status);
            status.classList.add(task.status);
            status.setAttribute('data-task_id', task.task_id);
            container.classList.toggle('dn', false);
            top_button.innerHTML = 'Мои задачи';
            top_button.setAttribute('onclick', 'javascript:app.pagemaker.print_personal_task_list();return false;');
            top_button.classList.toggle('dn', false);
            break;
        default:
            title.value = task.title;
            text.innerHTML = task.description;
            reward.value = task.reward;
            status.innerHTML = task.status;
            status.classList.add(task.status);
            top_button.innerHTML = 'Все задачи';
            top_button.setAttribute('onclick', 'javascript:app.pagemaker.print_global_task_list();return false;');
            top_button.classList.toggle('dn', false);
            break;
    }
    container.classList.toggle('dn', false);
};

let clear_new_task = () => {
    document.getElementById('task_title').innerHTML = '';
    document.getElementById('task_text').innerHTML = '';
    document.getElementById('task_reward').innerHTML = '';
    document.getElementById('add_task_container').classList.add('dn');
};

let edit_task = (button) => {
    if(button.getAttribute('data-action') === 'edit') {
        button.innerHTML = 'Применить';
        button.setAttribute('data-action', 'save');
        let ititle = document.getElementById('task_title');
        let itext = document.getElementById('task_text');
        let ireward = document.getElementById('task_reward');
        let istatus = document.getElementById('task_status');
        ititle.removeAttribute('disabled');
        itext.removeAttribute('disabled');
        ireward.removeAttribute('disabled');
        ititle.classList.remove('outborder');
        itext.classList.remove('outborder');
        ireward.classList.remove('outborder');
        istatus.innerHTML = '<a href="#" onclick="javascript:remove_task(this.parentNode.getAttribute(\'data-task_id\'));return false;">Удалить задание</a>'
    }else{
        let ititle = document.getElementById('task_title');
        let itext = document.getElementById('task_text');
        let ireward = document.getElementById('task_reward');
        let istatus = document.getElementById('task_status');
        let send = true;
        if(!validate_form(ititle)){
            send = false;
            ititle.style.borderColor = '#CC0000';
        }
        if(!validate_form(itext)){
            send = false;
            itext.style.borderColor = '#CC0000';
        }
        if(!validate_form(ireward)){
            send = false;
            ireward.style.borderColor = '#CC0000';
        }
        if(send){
            send_task_to_server({task_id: istatus.getAttribute('data-task_id'), task_title: ititle.value ,task_text: itext.value , task_reward: ireward.value}, 'update');
        }
    }
};

let remove_task = (task_id) => {
    send_task_to_server({task_id: task_id}, 'remove');
};

let send_task_to_server = (task, action) => {
    let method, url, params, on_send_request_on_server;
    switch(action){
        case 'new':
            method = 'POST';
            url = 'index.php?r=task&a=new';
            params = task;
            on_send_request_on_server = (answ) => {
                if(answ.target.status !== 200){
                    task_reward.value = app.user.balance;
                    task_reward.style.borderColor = '#CC0000';
                }
                else{
                    clear_new_task();
                    clear_task_list();
                    app.pagemaker.print_personal_task_list();
                }
            };
            break;
        case 'remove':
            method = 'PUT';
            url = 'index.php?r=task&a=remove';
            params = {task_id: task.task_id};
            on_send_request_on_server = (answ) => {
                if(answ.target.status === 200){
                    app.pagemaker.print_personal_task_list();
                }else{
                    let istatus = document.getElementById('task_status');
                    istatus.innerHTML = istatus.getAttribute('data-status');
                }
            };
            break;
        case 'update':
            method = 'PUT';
            url = 'index.php?r=task&a=update';
            params = task;
            on_send_request_on_server = (answ) => {
                if(answ.target.status === 200){
                    app.pagemaker.print_personal_task_list();
                }else{
                }
            };
            break;
    }

    app.send_request_to_server(method, url, params, on_send_request_on_server);
};

let load_task = (task_id) => {
    let on_send_request_to_server = (answ) => {
        if(answ.target.status !== 200)
            return false;
        let task = JSON.parse(answ.target.responseText);
        print_task(task);
    };
    app.send_request_to_server('GET', 'index.php?r=task&a=get_by_id&task_id='+task_id, {}, on_send_request_to_server);
};

let subscribe_task = (task_id, subscribe = true) => {
    let on_send_request_to_server = (answ) => {
        let bottom_button = document.getElementById('bottom_task_button');
        if(answ.target.status === 200){
            if(subscribe){
                bottom_button.setAttribute('onclick', 'javascript:subscribe_task('+task_id+', false);return false;');
                bottom_button.innerHTML = 'Отказаться';
                bottom_button.classList.toggle('dn', false);

            }else {
                bottom_button.setAttribute('onclick', 'javascript:subscribe_task(' + task_id + ');return false;');
                bottom_button.innerHTML = 'Я это выполню!';
                bottom_button.classList.toggle('dn', false);
            }
        }else{

        }
    };
    let action = subscribe ? 'subscribe' : 'unsubscribe';
    app.send_request_to_server('PUT', 'index.php?r=task&a='+action, {task_id: task_id}, on_send_request_to_server);
};