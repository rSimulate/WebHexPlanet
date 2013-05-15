function validateForm()
{
    var x=document.forms["myForm"]["fname"].value;
    if (x==null || x=="")
    {
        alert("First name must be filled out");
        return false;
    }
}