using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JOJWInvoicePendingQty_Filter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string RN_No { get; set; }
        public string VendorDN_No { get; set; }
        public string JW_SO_No { get; set; }
        public long? JW_Vendor_Number { get; set; }
        public long? JPRS_Number { get; set; }
        public long? ItemGroup_Number { get; set; }
        public long? Item_Number { get; set; }
    }

    public class JOJWInvoicePendingQty_DTO
    {
        public long RNNumber { get; set; }
        public string RNNo { get; set; }
        public string RNDate { get; set; }

        public string VendorDCNo { get; set; }
        public string VendorDCDate { get; set; }

        public long? JW_SO_Number { get; set; }
        public string JW_SO_No { get; set; }
        public string JW_SO_Date { get; set; }

        public long JW_Vendor_Number { get; set; }
        public string JW_Vendor_Name { get; set; }

        public long JPRS_Number { get; set; }
        public string ProcessName { get; set; }

        public long? ItemGroupNumber { get; set; }
        public string ItemGroupName { get; set; }

        public long Item_Number { get; set; }
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public string OuterDia { get; set; }
        public string Thickness { get; set; }
        public string Length { get; set; }
        public string MaterialGrade { get; set; }

        public long UoM_Number { get; set; }
        public string UOM { get; set; }

        public decimal ReceivedQty { get; set; }
        public decimal InvoicedQty { get; set; }
        public decimal PendingQty { get; set; }
    }
}