var cargaHoraria = {};
var codigoEditar = null;

$(document).ready(function(){
    $(".form-control").change(function(){
        verificaCampos();
    });
    $("#saida, #saida_almoco").blur(function() { 
        calculaHoras();
    });

    $("#botao").click(function(){
        salvarCargaHoraria(calculaHoras());
    });

    inicializar();


});

function inicializar(){
    if (localStorage.codApontamento == null){
        localStorage.codApontamento = 1;
    }
    if (localStorage.apontamentos == null) {
        localStorage.apontamentos = JSON.stringify([]);
    }
    atualizaTabela();
}

function calculaHoras(){
    cargaHoraria.data= $("#data").val();
    cargaHoraria.chegada = $("#chegada").val();
    cargaHoraria.saidaAlmoco = $("#saida_almoco").val();
    cargaHoraria.retornoAlmoco = $("#retorno_almoco").val();
    cargaHoraria.saida = $("#saida").val();

    total = diferencaHoras();
    $("#horas_trabalhadas").html(total);
    $("#totalGeral").html(cargaHoraria.geral);
}

function salvarCargaHoraria(){ 
    var apontamentos = JSON.parse(localStorage.apontamentos);
    cargaHoraria.codigo = geraCodigo();
    apontamentos.push(cargaHoraria);
    localStorage.apontamentos = JSON.stringify(apontamentos);
    atualizaTabela();
    limpaCampos();
    verificaCampos();

}

function geraCodigo(){
    var cod = Number(localStorage.codApontamento);
    localStorage.codApontamento = cod + 1;
    return cod;
}

function diferencaHoras() {
    h1 = (cargaHoraria.chegada == "" ? [0,0] : cargaHoraria.chegada.split(':'));
    h2 = (cargaHoraria.saidaAlmoco == "" ? [0,0] : cargaHoraria.saidaAlmoco.split(':'));
    h3 = (cargaHoraria.retornoAlmoco == "" ? [0,0] : cargaHoraria.retornoAlmoco.split(':'));
    h4 = (cargaHoraria.saida == "" ? [0,0] : cargaHoraria.saida.split(':'));

    horas = (parseInt(h4[0])-parseInt(h3[0]))+(parseInt(h2[0])-parseInt(h1[0]));    
    minutos = (parseInt(h4[1]) - parseInt(h3[1])) + (parseInt(h2[1]) - parseInt(h1[1]));
     
    if(minutos < 0){
        minutos += 60;
        horas -= 1;
    }
    horaFinal = (horas) + "h e " + (minutos) + "min";
    cargaHoraria.total = horaFinal;
    cargaHoraria.totalHoras = horas;
    cargaHoraria.totalMinutos = minutos;
    return horaFinal;
}

function atualizaTabela(){
    var rows = "";
    var apontamentos = JSON.parse(localStorage.apontamentos);
    $.each(apontamentos, function(index, value){
        var item = "<tr id='content'><td>" + value.data + "</td>" +
                    "<td>" + value.chegada + "</td>" +
                    "<td>" + value.saidaAlmoco + "</td>" +
                    "<td>" + value.retornoAlmoco + "</td>" +
                    "<td>" + value.saida + "</td>" +
                    "<td>" + value.total + "</td>" + 
                    "<td><a href='#' onclick='editar("+value.codigo+")' id='editar'>editar</a></tr>";
        rows += item;
    });
    $("#myDataTable tr#content").remove();
    $("#fields").after(rows);
    calculaTotalHorasTrabalhadas();
    // $("#totalGeral").html((horasGeral) + "h e " + (minutosGeral) + "min");
}

function limpaCampos(){
    $(".form-control").val("");
    cargaHoraria = {};
    $("#horas_trabalhadas").html("");
}

function verificaCampos() {
    var empty = false;
    $(".form-control").each(function(){
        if($(this).val().length === 0){
            empty = true;
        }
    });
    $("#botao").prop("disabled", empty);
}

 function editar(codigo){
    var apontamento = buscaApontamentoPorCodigo(codigo);
    cargaHoraria = apontamento;
    $("#data").val(apontamento.data);
    $("#chegada").val(apontamento.chegada);
    $("#saida_almoco").val(apontamento.saidaAlmoco);
    $("#retorno_almoco").val(apontamento.retornoAlmoco);
    $("#saida").val(apontamento.saida);
    $("#botao").css('display','none');
    $("#editar").css('display','block');
    codigoEditar = codigo;
    calculaTotalHorasTrabalhadas();
}

function buscaApontamentoPorCodigo(codigo) {
    var apontamentos = JSON.parse(localStorage.apontamentos);
    var retorno = $.grep(apontamentos, function(apontamento, index){
        return apontamento.codigo === codigo;
    });
    return retorno[0];
}

function editarApontamento(){
     if (codigoEditar != null){
        var apontamentos = JSON.parse(localStorage.apontamentos);
        apontamentos[codigoEditar - 1] = cargaHoraria;
        localStorage.apontamentos = JSON.stringify(apontamentos);
        atualizaTabela();
        limpaCampos();
        verificaCampos();
        $("#editar").css('display','none');
        $("#botao").css('display','block');
        codigoEditar = null;
        cargaHoraria = {};
    }
}

function calculaTotalHorasTrabalhadas(){
    var totalHoras = 0;
    var apontamentos = JSON.parse(localStorage.apontamentos);
    var arrayDeHoras = $.map(apontamentos, function(apontamento, index){
        return apontamento.totalHoras;
    });
    $.each(arrayDeHoras, function(index, hora){
        totalHoras += hora;
    });
    console.log(arrayDeHoras);
    $("#totalGeral").html(totalHoras + "h");
}

function totalHorasPorMes() {
    var apontamentos = JSON.parse(localStorage.apontamentos);
    var apontamentosPorMes = [];

    for(i = 0; i < 12; i++){
        var month = i < 10 ? "0" + i : String(i);
        apontamentosPorMes[i] = $.grep(apontamentos, function(apontamento, index){
            var data = new Date(apontamento.data);
            return data.getMonth() === i;
        });
    }

    var horasPorMes = $.map(apontamentosPorMes, function(arrayDeApontamentos, index){
        var totalHorasMes = 0;
        for(i = 0; i < arrayDeApontamentos.length; i++){
            var apt = arrayDeApontamentos[i];
            totalHorasMes += apt.totalHoras;
        }
        return totalHorasMes;
    });

    return horasPorMes;
}

var ctx = document.getElementById("AnualChart");

var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        datasets: [{
            label: 'horas trabalhadas',
            data: totalHorasPorMes()
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});

var ctx = document.getElementById("SemestralChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        datasets: [{
            label: 'horas trabalhadas',
            data: [60,20,10,5,12,100]
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});

var ctx = document.getElementById("MesChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Julho"],
        datasets: [{
            label: 'horas trabalhadas',
            data: [60]
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});

var ctx = document.getElementById("SemanalChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
        datasets: [{
            label: 'horas trabalhadas',
            data: [60,20,10,5,12,100, 0]
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});