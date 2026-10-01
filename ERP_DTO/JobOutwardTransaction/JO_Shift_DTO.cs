using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_Shift_DTO
    {
        public Int64 JSFT_Number { get; set; }

        [Display(Name = "Shift Name")]
        [Required(ErrorMessage = "Shift Name is Required")]
        [MaxLength(25, ErrorMessage = "Shift Name cannot be longer than 25 characters.")]
        public String? JSFT_ShiftName { get; set; }

        [Display(Name = "Description")]
        [MaxLength(100, ErrorMessage = "Description cannot be longer than 100 characters.")]
        public String? JSFT_Description { get; set; }

        public String? JSFT_DeleteNumbers { get; set; }

        public Int64 JSFT_CreatorCode { get; set; }

        public Int16 JSFT_Id { get; set; }

        public void Reset()
        {
            this.JSFT_Number = 0;
            this.JSFT_ShiftName = string.Empty;
            this.JSFT_Description = string.Empty;
            this.JSFT_DeleteNumbers = string.Empty;
            this.JSFT_CreatorCode = 0;
            this.JSFT_Id = 0;
        }
    }
}
