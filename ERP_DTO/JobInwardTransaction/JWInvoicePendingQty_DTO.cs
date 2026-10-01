using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    public class JWInvoicePendingQty_Filter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string DN_No { get; set; }
        public string JW_SO_No { get; set; }
        public long? JW_Customer_Number { get; set; }
        public long? PRS_Number { get; set; }
        public long? ItemGroup_Number { get; set; }
        public long? Item_Number { get; set; }
    }

    public class JWInvoicePendingQty_DTO
    {
        public long JIDNH_Number { get; set; }
        public string JIDNH_DN_No { get; set; }
        public string JIDNH_DN_Date { get; set; }

        public long? JW_SO_Number { get; set; }
        public string JW_SO_No { get; set; }
        public string JW_SO_Date { get; set; }

        public long JIDNH_JW_Customer_Number { get; set; }
        public string JW_Customer_Name { get; set; }

        public long JIDNI_PRS_Number { get; set; }
        public string PRS_ProcessName { get; set; }

        public long? ItemGroupNumber { get; set; }
        public string ItemGroupName { get; set; }

        public long JIDNI_Item_Number { get; set; }
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public string OuterDia { get; set; }
        public string Thickness { get; set; }
        public string Length { get; set; }
        public string MaterialGrade { get; set; }

        public long JIDNI_UoM_Number { get; set; }
        public string UOM { get; set; }

        public decimal DeliveredQty { get; set; }
        public decimal InvoicedQty { get; set; }
        public decimal PendingQty { get; set; }
    }
}
