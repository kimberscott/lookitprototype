var temp;
var i ;
var j;
var range ;
var s = [""];
var result;
var move;
// Serialize the data and return its object
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Set the radio button value in the text box to be stored in the db.
function set(radio){
    var val_ = $(radio).val();
    var td = $(radio).attr("name");
    td = td.substr(-1);
    if(td == '_'){td = ''};
        $(radio).closest("table").next().val(val_);
    }

// Validations for the first page of the registration pop-up,
// Validations for Name, email, password and confirm password.
function validation(){
    var isValid = 1;
    var pass = 1;

    $("#error").html("");
        if($("#name")){// validations for name
            if($("#name").val() == ""){
                $("#error").append('<label id="name_error" class="error">Please enter your name.<br></label>');
                isValid = 0;
            }
        }
        $('*').removeClass('hasError');
            if($("input[name = child_name]")){// validation for Child's name
                var i = 1;
            $(".chile_name").each(function(){

                s[i] = "";
                if(($(this).attr("id") != 'child_name') && ($(this).val() == "")){
                    s[i] += '<label id="child_name_error" class="error">Please enter a name for Child '+ i +'.<br></label>';
                    $(this).addClass('hasError');
                    isValid = 0;
                }
                i++;
            });
        }
        if($("input[name = dob]")){// Validations for date of birth
            var i = 1;
            $(".datepickerinput").each(function(){
                if($(this).attr("id") != 'dp'){
                    $(this).attr('value', $(this).prop('value'))
                    if($(this).val() == "" || $(this).val() == "MM/DD/YYYY"){
                        s[i] += '<label id="dob_error" class="error">Please enter the date of birth of Child '+ i +'.<br></label>';
                        $(this).parent().addClass('hasError');
                        isValid = 0;
                        alert('dob');
                    }
                    else if(isValidDate($(this).val()) == "format"){
                        s[i] += '<label id="dob_error" class="error">Please enter the date of birth of Child '+ i +' in correct format.<br></label>';
                        $(this).parent().addClass('hasError');
                        isValid = 0;
                    }
                    else if(isValidDate($(this).val()) == "date"){
                        s[i] += '<label id="dob_error" class="error">Please enter a valid date of birth of Child '+ i +' .<br></label>';
                        $(this).parent().addClass('hasError');
                        isValid = 0;
                    }
                }
                i++;
            });
}
        if($("input[name = gender]")){ // Validations for Gender
            var i = 1;
            $(".gender").each(function(){
                if(($(this).attr("id") != 'gender') && ($(this).val() == "")){
                    s[i] += "<label id='gender_error' class='error'>Please select the gender of Child "+ i +".<br></label>";
                    $(this).prev().addClass('hasError');
                    isValid = 0;
                }
                i++;
            });
        }
        for(var x=0;x<$('.chile_name').length;x++){
            if($('.chile_name').length == 1){
                $("#error").append("<label id='child_error' class='error'>Please enter at least one child's details.<br></label>");
                isValid = 0;
            }
            $("#error").append(s[x]);
        }

        return isValid;
    }


// Remove the child on click , if added by mistake
function remove1(closed){

    var z = 1;
    $(closed).closest("table").remove();
    $(".count").closest("table").each(function(){
        $(this).find("tr").parent().children().next().find("td").first().html("Child " + z);
        z = z+1;
    });
    i -= 1;
    j--;
}
