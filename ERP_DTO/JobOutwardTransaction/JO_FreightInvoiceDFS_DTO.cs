using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_FreightInvoiceDFS_DTO
    {
        public long JOFTI_DFS_Number { get; set; }

        [Display(Name = "Category")]
        public string? JOFTI_DFS_Category { get; set; }

        [Display(Name = "JW Vendor")]
        public long JOFTI_DFS_JW_Vendor_Number { get; set; }

        public string? JOFTI_DFS_JW_Vendor_Name { get; set; }   // display only

        [Display(Name = "Payment Terms")]
        public string? JOFTI_DFS_PaymentTerms { get; set; }

        [Display(Name = "Method of Payment")]
        public string? JOFTI_DFS_PaymentMethod { get; set; }

        [Display(Name = "Remarks")]
        public string? JOFTI_DFS_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string? Result_Message { get; set; }
    }
}
