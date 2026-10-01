using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_Process_DTO
    {
        public Int64 JPRS_Number { get; set; }

        [Display(Name = "Process Name")]
        [Required(ErrorMessage = "Process Name is Required")]
        [MaxLength(25, ErrorMessage = "Process Name cannot be longer than 25 characters.")]
        public String? JPRS_ProcessName { get; set; }

        [Display(Name = "Description")]
        [MaxLength(100, ErrorMessage = "Description cannot be longer than 100 characters.")]
        public String? JPRS_Description { get; set; }

        [Display(Name = "Consumption UoM")]
        [Required(ErrorMessage = "Consumption UoM is Required")]
        public Int64 JPRS_Cons_UoM_Number { get; set; }

        [Display(Name = "Production UoM")]
        [Required(ErrorMessage = "Production UoM is Required")]
        public Int64 JPRS_Prod_UoM_Number { get; set; }

        [Display(Name = "Scrap UoM")]
        [Required(ErrorMessage = "Scrap UoM is Required")]
        public Int64 JPRS_Scrap_UoM_Number { get; set; }

        [Display(Name = "Scrap ItemCode")]
        [Required(ErrorMessage = "Scrap ItemCode is Required")]
        public Int64 JPRS_Item_Number { get; set; }

        [Display(Name = "SAC")]
        [Required(ErrorMessage = "SAC is Required")]
        public Int64 JPRS_SAC_Number { get; set; }

        // List display only (from SP joins)
        public String? JPRS_ConsUoMName { get; set; }
        public String? JPRS_ProdUoMName { get; set; }
        public String? JPRS_ScrapUoMName { get; set; }
        public String? JPRS_ScrapItemCode { get; set; }
        public String? JPRS_SACCode { get; set; }

        public String? JPRS_DeleteNumbers { get; set; }

        public Int64 JPRS_CreatorCode { get; set; }

        public Int16 JPRS_Id { get; set; }

        public void Reset()
        {
            this.JPRS_Number = 0;
            this.JPRS_ProcessName = string.Empty;
            this.JPRS_Description = string.Empty;
            this.JPRS_Cons_UoM_Number = 0;
            this.JPRS_Prod_UoM_Number = 0;
            this.JPRS_Scrap_UoM_Number = 0;
            this.JPRS_Item_Number = 0;
            this.JPRS_SAC_Number = 0;
            this.JPRS_DeleteNumbers = string.Empty;
            this.JPRS_CreatorCode = 0;
            this.JPRS_Id = 0;
        }
    }
}
