using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_ReceiptNoteDFS_DTO
    {
        public long JORN_DFS_Number { get; set; }

        [Display(Name = "Material Segregation")]
        public long JORN_DFS_MS_Number { get; set; }

        [Display(Name = "JW Vendor")]
        public long JORN_DFS_JW_Vendor_Number { get; set; }

        public string? JORN_DFS_JW_Vendor_Name { get; set; }   // display only

        [Display(Name = "Freight Applicable")]
        public string? JORN_DFS_IsFreightApplicable { get; set; }   // "Yes" / "No"

        [Display(Name = "Remarks")]
        public string? JORN_DFS_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string? Result_Message { get; set; }
    }
}
