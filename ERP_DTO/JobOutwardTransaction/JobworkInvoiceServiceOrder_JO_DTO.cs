using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JobworkInvoiceServiceOrder_JO_DTO
    {
        public long JOJWI_SVOH_Number { get; set; }

        [Display(Name = "Material Segregation")]
        public long JOJWI_SVOH_MS_Number { get; set; }

        [Display(Name = "JW Vendor")]
        public long JOJWI_SVOH_JW_Vendor_Number { get; set; }

        public string? JOJWI_SVOH_JW_Vendor_Name { get; set; }   // display only

        [Display(Name = "Terms of Payment")]
        public string? JOJWI_SVOH_PaymentTerms { get; set; }

        [Display(Name = "Terms of Delivery")]
        public string? JOJWI_SVOH_DeliveryTerms { get; set; }

        [Display(Name = "Mode of Delivery")]
        public string? JOJWI_SVOH_DeliveryMode { get; set; }

        [Display(Name = "Tax")]
        public string? JOJWI_SVOH_Tax { get; set; }

        [Display(Name = "Technical delivery conditions")]
        public string? JOJWI_SVOH_TDC { get; set; }

        [Display(Name = "Remarks")]
        public string? JOJWI_SVOH_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string? Result_Message { get; set; }
    }
}
