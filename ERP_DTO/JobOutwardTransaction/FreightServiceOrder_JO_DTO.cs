using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    public class FreightServiceOrder_JO_DTO
    {
        public long JOFRT_SVOH_Number { get; set; }

        [Display(Name = "Category")]
        public string? JOFRT_SVOH_Category { get; set; }

        [Display(Name = "JW Vendor")]
        public long JOFRT_SVOH_JW_Vendor_Number { get; set; }

        public string? JOFRT_SVOH_JW_Vendor_Name { get; set; }   // display only

        [Display(Name = "Terms of Payment")]
        public string? JOFRT_SVOH_PaymentTerms { get; set; }

        [Display(Name = "Terms of Delivery")]
        public string? JOFRT_SVOH_DeliveryTerms { get; set; }

        [Display(Name = "Mode of Delivery")]
        public string? JOFRT_SVOH_DeliveryMode { get; set; }

        [Display(Name = "Tax")]
        public string? JOFRT_SVOH_Tax { get; set; }

        [Display(Name = "Technical delivery conditions")]
        public string? JOFRT_SVOH_TDC { get; set; }

        [Display(Name = "Remarks")]
        public string? JOFRT_SVOH_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string? Result_Message { get; set; }
    }
}
