export const captializeFirstLetter = (text: string)=>{
    return text.charAt(0).toUpperCase() + text.slice(1); 
};

export const formtDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US",{ month: "short", day:"numeric", year: "numeric" });
};

export const getStatusColor = ( status: string) =>{
    switch (status.toLowerCase()){
        case "delivered":
            return "#10B981";
        case "shipped":
            return "#3B82F6";
        case "pending":
            return "#F59E0B";
        default:
            return "#666";
    }
};