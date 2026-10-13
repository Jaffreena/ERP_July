using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_DeliveryNoteDFS_DTO
    {
        public long JODN_DFS_Number { get; set; }

        [Display(Name = "Material Segregation")]
        public long JODN_DFS_MS_Number { get; set; }

        [Display(Name = "JW Vendor")]
        public long JODN_DFS_JW_Vendor_Number { get; set; }

        public string? JODN_DFS_JW_Vendor_Name { get; set; }   // display only

        [Display(Name = "Freight Applicable")]
        public string? JODN_DFS_IsFreightApplicable { get; set; }   // "Yes" / "No"

        [Display(Name = "Terms of Payment")]
        public string? JODN_DFS_PaymentTerms { get; set; }

        [Display(Name = "Terms of Delivery")]
        public string? JODN_DFS_DeliveryTerms { get; set; }

        [Display(Name = "Mode of Delivery")]
        public string? JODN_DFS_DeliveryMode { get; set; }

        [Display(Name = "Despatch Document No.")]
        public string? JODN_DFS_DespatchDocumentNo { get; set; }

        [Display(Name = "Despatched through")]
        public string? JODN_DFS_DespatchedThrough { get; set; }

        [Display(Name = "Remarks")]
        public string? JODN_DFS_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string? Result_Message { get; set; }
    }
}
