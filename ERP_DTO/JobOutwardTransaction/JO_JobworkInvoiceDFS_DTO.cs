using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_JobworkInvoiceDFS_DTO
    {
        public long JOSVI_DFS_Number { get; set; }

        [Display(Name = "Material Segregation")]
        public long JOSVI_DFS_MS_Number { get; set; }

        [Display(Name = "JW Vendor")]
        public long JOSVI_DFS_JW_Vendor_Number { get; set; }

        public string? JOSVI_DFS_JW_Vendor_Name { get; set; }   // display only

        [Display(Name = "Payment Terms")]
        public string? JOSVI_DFS_PaymentTerms { get; set; }

        [Display(Name = "Method of Payment")]
        public string? JOSVI_DFS_PaymentMethod { get; set; }

        [Display(Name = "Remarks")]
        public string? JOSVI_DFS_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string? Result_Message { get; set; }
    }
}
