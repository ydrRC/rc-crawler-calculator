# RC Crawler Gear Ratio Calculator

A professional web-based calculator for RC crawler gear ratios and theoretical speeds. This tool helps RC enthusiasts optimize their crawler setups by calculating final drive ratios and estimated top speeds based on motor specifications.

## 🚀 Features

- **Comprehensive Gear Ratio Calculations**: Calculate motor, transmission, and final drive ratios
- **Speed Calculations**: Theoretical top speeds based on motor KV, voltage, and tire size
- **Extensive Database**: 
  - 50+ transmission options from major manufacturers
  - 80+ axle configurations including portal and standard axles
- **Advanced Options**:
  - Reverse transmission ratio capability
  - Metric/Imperial tire size support
  - Real-time calculations as you type
- **Professional UI**: Modern, responsive design that works on all devices
- **Data Validation**: Input validation with helpful warnings and error messages

## 🛠️ Installation

### Option 1: Download and Run Locally
1. Download all project files
2. Ensure the folder structure matches:
   ```
   rc-crawler-calculator/
   ├── index.html
   ├── css/styles.css
   ├── js/data.js
   ├── js/calculator.js
   └── js/ui.js
   ```
3. Open `index.html` in any modern web browser

### Option 2: Web Server (Recommended)
For best performance, serve the files through a web server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

## 📊 Usage

### Basic Calculation
1. **Enter Gear Specifications**:
   - Pinion gear tooth count (8-30 teeth)
   - Spur gear tooth count (20-100 teeth)

2. **Select Components**:
   - Choose your transmission from the dropdown
   - Select front axle configuration
   - Select rear axle configuration

3. **Optional Speed Calculation**:
   - Enter motor KV rating
   - Set maximum battery voltage
   - Specify tire size (inches or mm)

4. **View Results**:
   - Motor gear ratio
   - Final front and rear drive ratios
   - Theoretical top speeds (if motor specs provided)

### Advanced Features

#### Reverse Transmission
Check the "Reverse Transmission Ratio" option to swap front and rear transmission outputs. This is useful for certain transmission configurations.

#### Tire Size Units
Toggle between inches and millimeters for tire diameter input. Common sizes:
- **Scale Options**: Various tooth count combinations for fine-tuning

## 🎯 Use Cases

### Competition Setup
- **Rock Racing**: Lower ratios (20-40:1) for speed
- **Scale Crawling**: Higher ratios (60-100:1) for torque and control
- **Trail Running**: Balanced ratios (40-60:1) for versatility

### Motor Recommendations
- **Brushed Motors**: 1200-2200 KV typically
- **Brushless Motors**: 1400-3500 KV range
- **High Torque**: Lower KV (800-1500) for technical crawling

## 🧪 Example Calculations

### Typical Scale Crawler Setup
```
Pinion: 12T
Spur: 56T
Transmission: Axial SCX10 Pro (2.222:1)
Axles: AR44 Standard (3.750:1)
Motor: 1800 KV
Battery: 7.4V (2S LiPo)
Tires: 4.19"

Results:
- Motor Ratio: 4.67:1
- Final Ratio: 38.97:1
- Theoretical Speed: 5.2 MPH
```

### Speed-Focused Setup
```
Pinion: 16T
Spur: 48T
Transmission: Traxxas TRX-4 High (0.800:1)
Axles: AR44 OD2 (3.000:1)
Motor: 2200 KV
Battery: 11.1V (3S LiPo)
Tires: 4.75"

Results:
- Motor Ratio: 3.00:1
- Final Ratio: 7.20:1
- Theoretical Speed: 22.4 MPH
```

## 🛡️ Browser Support

- **Chrome**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 70+

## 🔄 Updates and Maintenance

### Adding New Components

#### New Transmission
Edit `js/data.js` and add to the `TRANSMISSIONS` object:
```javascript
"New Transmission Name": { front: 2.500, rear: 3.000 }
```

#### New Axle
Add to the `AXLES` object:
```javascript
"New Axle Name": 4.125
```

### Data Sources
All gear ratios are sourced from:
- Manufacturer specifications
- Community measurements
- RC crawler forums and databases

## 🐛 Troubleshooting

### Common Issues

**Calculator not loading**:
- Ensure all JavaScript files are in the correct folders
- Check browser console for errors
- Verify file permissions

**Incorrect calculations**:
- Verify input values are within expected ranges
- Check that all required fields are filled
- Ensure transmission/axle selections are valid

**Mobile display issues**:
- Calculator is fully responsive
- If layout appears broken, try refreshing the page
- Report persistent mobile issues

### Performance Tips
- Use a local web server for best performance
- Modern browsers cache files for faster subsequent loads
- Calculator works offline once loaded

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Data Contributions
- **New Transmissions**: Submit specs with front/rear ratios
- **New Axles**: Include accurate gear ratios
- **Corrections**: Report any incorrect data

### Feature Requests
- Additional calculation modes
- Export/import functionality
- Comparison tools
- Mobile app version

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- **Data Sources**: RC crawler community, manufacturer specs
- **Design Inspiration**: Modern web calculator interfaces
- **Testing**: RC crawler enthusiasts and competition drivers

## 📞 Support

For questions, bug reports, or feature requests:
- Create an issue in the project repository
- Contact through RC crawler forums
- Email: [your-email@domain.com]

## 🔮 Roadmap

### Version 2.0 (Planned)
- [ ] Save/load configurations
- [ ] Multiple setup comparisons
- [ ] Advanced charts and visualizations
- [ ] Battery life estimations
- [ ] Torque calculations
- [ ] Mobile app version

### Version 3.0 (Future)
- [ ] Community database integration
- [ ] Setup sharing platform
- [ ] Competition mode calculations
- [ ] Advanced motor curve analysis

---

**Built with ❤️ for the RC crawling community**

*Last updated: June 2025* tires**: 4.19" (106mm), 4.75" (121mm)
- **Larger tires**: 5.5" (140mm), 6" (152mm)

## 🔧 Technical Details

### Calculation Formulas

**Motor Gear Ratio**:
```
Motor Ratio = Spur Teeth ÷ Pinion Teeth
```

**Final Drive Ratio**:
```
Final Ratio = Motor Ratio × Transmission Ratio × Axle Ratio
```

**Theoretical Speed (MPH)**:
```
Speed = (Motor RPM ÷ Final Ratio) × Tire Circumference × 60 ÷ 63,360
Where: Motor RPM = Motor KV × Battery Voltage
```

### Supported Components

#### Transmissions
- **Axial**: SCX10 Pro, SCX10.3, Capra, Yeti series
- **Dlux**: Cheez Berger, Ham Berger, Fargo, Portal series
- **Element**: Stealth series with various overdrive options
- **Exo**: Alpinist, Boulderer, Trad Climber series
- **TGH**: O.G., Creeper-T, T-210 series
- **Vanquish**: VFD series with multiple configurations
- And many more...

#### Axles
- **Axial**: AR44, AR45, AR60 with various gear sets
- **Portal Axles**: Multiple gear ratio options
- **Aftermarket**: Dlux, MEUS Racing, VP, and others
- **Scale